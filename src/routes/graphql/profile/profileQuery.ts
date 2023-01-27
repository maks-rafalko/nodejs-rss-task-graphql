import {GraphQLString} from "graphql";
import {FastifyInstance} from "fastify";
import {profileType} from "./profileType";

const profileQuery = {
  type: profileType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.profiles.findOne({key: 'id', equals: args.id});
  }
};

export { profileQuery };
