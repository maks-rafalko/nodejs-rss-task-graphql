import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';
import {userQuery} from './user/userQuery';
import {usersQuery} from "./user/usersQuery";
import {profileQuery} from "./profile/profileQuery";
import {profilesQuery} from "./profile/profilesQuery";
import {postQuery} from "./post/postQuery";
import {postsQuery} from "./post/postsQuery";
import {memberTypeQuery} from "./memberType/memberTypeQuery";
import {memberTypesQuery} from "./memberType/memberTypesQuery";

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

const schema = new GraphQLSchema({
  query: querySchema
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

      // const result = await this.graphql(query, variables);

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
