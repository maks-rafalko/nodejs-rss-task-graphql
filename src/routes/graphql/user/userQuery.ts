import {userType} from "./userType";
import {GraphQLString} from "graphql";
import {FastifyInstance} from "fastify";

const userQuery = {
  type: userType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.users.findOne({key: 'id', equals: args.id});
  }
};

export { userQuery };
