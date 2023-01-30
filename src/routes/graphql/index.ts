import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
  graphql,
  validate,
  parse,
  GraphQLSchema,
  GraphQLObjectType, DocumentNode, Source,
} from 'graphql';
import { userQuery } from './user/userQuery';
import { usersQuery } from './user/usersQuery';
import { profileQuery } from './profile/profileQuery';
import { profilesQuery } from './profile/profilesQuery';
import { postQuery } from './post/postQuery';
import { postsQuery } from './post/postsQuery';
import { memberTypeQuery } from './memberType/memberTypeQuery';
import { memberTypesQuery } from './memberType/memberTypesQuery';
import { createUserQuery } from './user/createUserQuery';
import { createProfileQuery } from './profile/createProfileQuery';
import { createPostQuery } from './post/createPostQuery';
import { updateUserQuery } from './user/updateUserQuery';
import { updateProfileQuery } from './profile/updateProfileQuery';
import { updatePostQuery } from './post/updatePostQuery';
import { updateMemberTypeQuery } from './memberType/updateMemberTypeQuery';
import { subscribeUserToQuery } from './user/subscribeUserToQuery';
import { unsubscribeUserFromQuery } from './user/unsubscribeUserFromQuery';
import * as depthLimit from 'graphql-depth-limit';
import {FastifyInstance} from "fastify";
import {GraphQLError} from "graphql/error/GraphQLError";
import * as DataLoader from "dataloader";
import {PostEntity} from "../../utils/DB/entities/DBPosts";
import * as lodash from 'lodash';
import {UserEntity} from "../../utils/DB/entities/DBUsers";
import {ProfileEntity} from "../../utils/DB/entities/DBProfiles";
import {Loaders} from "./Loaders";
import {MemberTypeEntity} from "../../utils/DB/entities/DBMemberTypes";

const GRAPHQL_QUERY_DEPTH_LIMIT = 6;

// tODO check REST patch schemas and allow the only same fields in graphql!
// todo in graphql, do not use http errors
// todo check all methods use variables instead of hardcoded values
// todo check in some playground - whether there are any warnings / errors
// todo remove commas (,) from all requests
// todo add postman collection

const querySchema = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: userQuery,
    users: usersQuery,

    profile: profileQuery,
    profiles: profilesQuery,

    post: postQuery,
    posts: postsQuery,

    memberType: memberTypeQuery,
    memberTypes: memberTypesQuery,
  }
});

const mutationSchema = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: createUserQuery,
    updateUser: updateUserQuery,
    subscribeUserTo: subscribeUserToQuery,
    unsubscribeUserFrom: unsubscribeUserFromQuery,

    createProfile: createProfileQuery,
    updateProfile: updateProfileQuery,

    createPost: createPostQuery,
    updatePost: updatePostQuery,

    updateMemberType: updateMemberTypeQuery,
  }
});

const schema = new GraphQLSchema({
  query: querySchema,
  mutation: mutationSchema,
});

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { query, variables } = request.body;
      const queryAsString = String(query);

      // @ts-ignore
      const validationErrors = validateQuery(queryAsString, fastify);

      if (validationErrors.length > 0) {
        reply.send({data: null, errors: validationErrors});
        return;
      }

      // @ts-ignore
      const loaders = createLoaders(fastify);

      return await graphql({
        schema,
        source: queryAsString,
        variableValues: variables,
        contextValue: {
          fastify,
          loaders
        },
      });
    }
  );
};

function validateQuery(queryAsString: string, fastify: FastifyInstance): ReadonlyArray<GraphQLError> {
  let documentAST: DocumentNode;

  try {
    documentAST = parse(new Source(queryAsString, 'GraphQL request'));
  } catch (syntaxError: any) {
    // Return 400: Bad Request if any syntax errors exist.
    throw fastify.httpErrors.badRequest(syntaxError.message);
  }

  const validationErrors = validate(schema, documentAST, [
    depthLimit(GRAPHQL_QUERY_DEPTH_LIMIT)
  ]);

  return validationErrors;
}

function createLoaders(fastify: FastifyInstance): Loaders {
  const postsByUserId = new DataLoader<string, PostEntity[]>(async (userIds: readonly string[]): Promise<PostEntity[][]> => {
    const posts = await fastify.db.posts.findMany({key: 'userId', equalsAnyOf: userIds as string[]});

    const groupedByUserId = lodash.groupBy(posts, 'userId');

    return userIds.map(userId => groupedByUserId[userId] ?? []);
  });

  const userById = new DataLoader<string, UserEntity>(async (userIds: readonly string[]): Promise<UserEntity[]> => {
    const users = await fastify.db.users.findMany({key: 'id', equalsAnyOf: userIds as string[]});

    const usersById: Record<string, UserEntity> = {};

    for (const user of users) {
      usersById[user.id] = user;
    }

    return userIds.map(userId => usersById[userId] ?? null);
  });

  const usersBySubscribedToUserIds = new DataLoader<string, UserEntity[]>(async (userIds: readonly string[]): Promise<UserEntity[][]> => {
    const users = await fastify.db.users.findMany({key: 'subscribedToUserIds', inArrayAnyOf: userIds as string[]});

    const usersBySubscribedToUserIds: Record<string, UserEntity[]> = {};

    for (const userId of userIds) {
      for (const user of users) {
        if (user.subscribedToUserIds.includes(userId)) {
          if (!usersBySubscribedToUserIds.hasOwnProperty(userId)) {
            usersBySubscribedToUserIds[userId] = [];
          }
          usersBySubscribedToUserIds[userId] = [user, ...usersBySubscribedToUserIds[userId]];
        }
      }
    }

    return userIds.map(userId => usersBySubscribedToUserIds[userId] ?? []);
  });

  const profilesByUserId = new DataLoader<string, ProfileEntity[]>(async (userIds: readonly string[]): Promise<ProfileEntity[][]> => {
    const profiles = await fastify.db.profiles.findMany({key: 'userId', equalsAnyOf: userIds as string[]});

    const groupedByUserId = lodash.groupBy(profiles, 'userId');

    return userIds.map(userId => groupedByUserId[userId] ?? []);
  });

  const memberTypeById = new DataLoader<string, MemberTypeEntity>(async (memberTypeIds: readonly string[]): Promise<MemberTypeEntity[]> => {
    const memberTypes: MemberTypeEntity[] = await fastify.db.memberTypes.findMany({key: 'id', equalsAnyOf: memberTypeIds as string[]});

    const memberTypesById: Record<string, MemberTypeEntity> = {};

    for (const memberType of memberTypes) {
      memberTypesById[memberType.id] = memberType;
    }

    return memberTypeIds.map(memberTypeId => memberTypesById[memberTypeId] ?? null);
  });

  return {
    userById,
    usersBySubscribedToUserIds,
    postsByUserId,
    profilesByUserId,
    memberTypeById,
    populateUserCache: (users: UserEntity[]): void => {
      for (const user of users) {
        userById.prime(user.id, user);
      }
    },
    populateMemberTypeCache: (memberTypes: MemberTypeEntity[]): void => {
      for (const memberType of memberTypes) {
        memberTypeById.prime(memberType.id, memberType);
      }
    }
  }
}

export default plugin;
