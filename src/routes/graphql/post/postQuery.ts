import {GraphQLString} from "graphql";
import {postType} from "./postType";
import {ContextValueType} from "../ContextValueType";

const postQuery = {
  type: postType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.fastify.db.posts.findOne({key: 'id', equals: args.id});
  }
};

export { postQuery };
