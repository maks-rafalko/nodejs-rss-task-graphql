import {GraphQLList} from "graphql";
import {userType} from "./userType";
import {FastifyInstance} from "fastify";

const usersQuery = {
  type: new GraphQLList(userType),
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.users.findMany();
  }
};

export { usersQuery}
