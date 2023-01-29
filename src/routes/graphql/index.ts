import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
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

// tODO check REST patch schemas and allow the only same fields in graphql!
// todo in graphql, do not use http errors
// todo check all methods use variables instead of hardcoded values
// check in some playground - whether there are any warnings / errors

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

      return await graphql({
        schema,
        source: String(query),
        variableValues: variables,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
