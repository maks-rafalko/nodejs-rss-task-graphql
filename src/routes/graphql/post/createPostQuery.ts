import {postCreateInput} from './postCreateInput';
import {FastifyInstance} from "fastify";
import {postType} from "./postType";
import {isUuid} from "../../../utils/isUuid";
import {ContextValueType} from "../ContextValueType";

const createPostQuery = {
  type: postType,
  args: {
    post: { type: postCreateInput }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    const fastify: FastifyInstance = context.fastify;
    const { userId } = args.post;

    if (!isUuid(userId)) {
      throw fastify.httpErrors.badRequest('User id is not a valid uuid');
    }

    const user = await fastify.db.users.findOne({key: 'id', equals: userId});

    if (user === null) {
      throw fastify.httpErrors.badRequest('User not found');
    }

    const post = await fastify.db.posts.create(args.post);

    return post;
  }
};

export { createPostQuery };
