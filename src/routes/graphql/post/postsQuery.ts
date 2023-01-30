import {GraphQLList} from "graphql";
import {postType} from "./postType";
import {ContextValueType} from "../ContextValueType";

const postsQuery = {
  type: new GraphQLList(postType),
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.fastify.db.posts.findMany();
  }
};

export { postsQuery}
