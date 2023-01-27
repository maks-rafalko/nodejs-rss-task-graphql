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
    user(id: ID!): User,

    profiles: [Profile!]!,
    profile(id: ID!): Profile,
    
    posts: [Post!]!,
    post(id: ID!): Post,
    
    memberTypes: [MemberType!]!,
    memberType(id: ID!): MemberType,
  }
`);

// The rootValue provides a resolver function for each API endpoint
const rootValue = {
  users: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.users.findMany();
  },
  user: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.users.findOne({key: 'id', equals: args.id});
  },
  profiles: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.profiles.findMany();
  },
  profile: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.profiles.findOne({key: 'id', equals: args.id});
  },
  posts: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.posts.findMany();
  },
  post: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.posts.findOne({key: 'id', equals: args.id});
  },
  memberTypes: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.memberTypes.findMany();
  },
  memberType: async (args: any, fastify: FastifyInstance) => {
    return await fastify.db.memberTypes.findOne({key: 'id', equals: args.id});
  }
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
