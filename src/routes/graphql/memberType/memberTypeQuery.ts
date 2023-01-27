import {GraphQLString} from "graphql";
import {FastifyInstance} from "fastify";
import {memberTypeType} from "./memberTypeType";

const memberTypeQuery = {
  type: memberTypeType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.memberTypes.findOne({key: 'id', equals: args.id});
  }
};

export { memberTypeQuery };
