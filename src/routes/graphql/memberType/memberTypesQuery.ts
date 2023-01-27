import {GraphQLList} from "graphql";
import {FastifyInstance} from "fastify";
import {memberTypeType} from "./memberTypeType";

const memberTypesQuery = {
  type: new GraphQLList(memberTypeType),
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.memberTypes.findMany();
  }
};

export { memberTypesQuery };
