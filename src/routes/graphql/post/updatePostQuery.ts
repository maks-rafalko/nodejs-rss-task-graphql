import {FastifyInstance} from "fastify";
import {postType} from "./postType";
import {isUuid} from "../../../utils/isUuid";
import {postUpdateInput} from "./postUpdateInput";
import {GraphQLString} from "graphql";

const updatePostQuery = {
  type: postType,
  args: {
    postId: { type: GraphQLString },
    post: { type: postUpdateInput }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    const id = args.postId;

    if (!isUuid(id)) {
      throw fastify.httpErrors.badRequest('Post id is not a valid uuid');
    }

    const post = await fastify.db.posts.findOne({key: 'id', equals: id});

    if (post === null) {
      throw fastify.httpErrors.notFound('Post not found');
    }

    const changed = await fastify.db.posts.change(id, args.post);

    return changed!;
  }
};

export { updatePostQuery };
