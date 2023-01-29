import {FastifyInstance} from "fastify";
import {userType} from "./userType";
import {isUuid} from "../../../utils/isUuid";
import {GraphQLString} from "graphql";
import {userUpdateInput} from "./userUpdateInput";

const updateUserQuery = {
  type: userType,
  args: {
    user: { type: userUpdateInput },
    userId: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    const id = args.userId;

    if (!isUuid(id)) {
      throw fastify.httpErrors.badRequest('User id is not a valid uuid');
    }

    const user = await fastify.db.users.findOne({key: 'id', equals: id});

    if (user === null) {
      throw fastify.httpErrors.notFound('User not found');
    }

    const changedUser = await fastify.db.users.change(id, args.user);

    return changedUser!;
  }
};

export { updateUserQuery };
