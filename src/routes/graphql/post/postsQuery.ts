import {GraphQLList} from "graphql";
import {FastifyInstance} from "fastify";
import {postType} from "./postType";

const postsQuery = {
  type: new GraphQLList(postType),
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.posts.findMany();
  }
};

export { postsQuery}
