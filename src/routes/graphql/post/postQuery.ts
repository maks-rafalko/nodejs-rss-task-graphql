import {GraphQLString} from "graphql";
import {FastifyInstance} from "fastify";
import {postType} from "./postType";

const postQuery = {
  type: postType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.posts.findOne({key: 'id', equals: args.id});
  }
};

export { postQuery };
