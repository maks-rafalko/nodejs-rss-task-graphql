import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql, buildSchema } from 'graphql';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello(name: String!): String
  }
`);

// The rootValue provides a resolver function for each API endpoint
const rootValue = {
  hello: (args: any) => {
    return `Hello world, ${args.name}!`;
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
        contextValue: fastify
      });
    }
  );
};

export default plugin;
