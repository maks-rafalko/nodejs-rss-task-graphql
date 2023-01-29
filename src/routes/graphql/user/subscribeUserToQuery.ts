import {FastifyInstance} from "fastify";
import {userType} from "./userType";
import {userSubscribeToInput} from "./userSubscribeToInput";

const subscribeUserToQuery = {
  type: userType,
  args: {
    payload: { type: userSubscribeToInput }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    const currentUserId = args.payload.currentUserId;
    const subscribeToUserId = args.payload.subscribeToUserId;

    const currentUser = await fastify.db.users.findOne({key: 'id', equals: currentUserId});

    if (currentUser === null) {
      throw fastify.httpErrors.notFound('Current user not found');
    }

    const userSubscribeTo = await fastify.db.users.findOne({key: 'id', equals: subscribeToUserId});

    if (userSubscribeTo === null) {
      throw fastify.httpErrors.notFound('User to subscribe to not found');
    }

    if (userSubscribeTo.subscribedToUserIds.includes(currentUserId)) {
      throw fastify.httpErrors.badRequest('User already subscribed to');
    }

    userSubscribeTo.subscribedToUserIds.push(currentUserId);

    await fastify.db.users.change(subscribeToUserId, userSubscribeTo);

    return currentUser;
  }
};

export { subscribeUserToQuery };
