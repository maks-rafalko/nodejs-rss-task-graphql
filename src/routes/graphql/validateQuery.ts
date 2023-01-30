import { FastifyInstance } from 'fastify';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { DocumentNode, GraphQLSchema, parse, Source, validate } from 'graphql/index';
import * as depthLimit from 'graphql-depth-limit';

const GRAPHQL_QUERY_DEPTH_LIMIT = 6;

const validateQuery = (schema: GraphQLSchema, queryAsString: string, fastify: FastifyInstance): ReadonlyArray<GraphQLError> => {
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
};

export { validateQuery };
