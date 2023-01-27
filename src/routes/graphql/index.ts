import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql, buildSchema } from 'graphql';
import { FastifyInstance } from 'fastify';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [Int!]!
  }
  
  type Profile {
    id: ID!
    avatar: String!
    sex: String!
    birthday: Int!
    country: String!
    street: String!
    city: String!
    memberTypeId: String!
    userId: String!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    userId: String!
  } 
  
  type MemberType {
    id: ID!
    discount: Int!,
    monthPostsLimit: Int!,
  }

  type Query {
    users: [User!]!,
    profiles: [Profile!]!,
    posts: [Post!]!,
    memberTypes: [MemberType!]!,
  }
`);

// The rootValue provides a resolver function for each API endpoint
const rootValue = {
  users: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.users.findMany();
  },
  profiles: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.profiles.findMany();
  },
  posts: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.posts.findMany();
  },
  memberTypes: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.memberTypes.findMany();
  },
};

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
        rootValue,
        variableValues: variables,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
