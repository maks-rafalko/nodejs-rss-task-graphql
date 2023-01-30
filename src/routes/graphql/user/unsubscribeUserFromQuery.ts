import { FastifyInstance } from 'fastify';
import { userType } from './userType';
import { userUnsubscribeFromInput } from './userUnsubscribeFromInput';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { removeArrayItem } from '../../../utils/removeArrayItem';
import { ContextValueType } from '../ContextValueType';

const unsubscribeUserFromQuery = {
  type: userType,
  args: {
    payload: { type: userUnsubscribeFromInput }
  },
  resolve: async (_: any, args: any, context: ContextValueType): Promise<UserEntity> => {
    const fastify: FastifyInstance = context.fastify;
    const unsubscribeFromUserId = args.payload.unsubscribeFromUserId;
    const currentUserId = args.payload.currentUserId;

    const userUnsubscribeFrom = await fastify.db.users.findOne({key: 'id', equals: unsubscribeFromUserId});

    if (userUnsubscribeFrom === null) {
      throw fastify.httpErrors.notFound('User to unsubscribe from not found');
    }

    const currentUser = await fastify.db.users.findOne({key: 'id', equals: currentUserId});

    if (currentUser === null) {
      throw fastify.httpErrors.notFound('Current user not found');
    }

    // `subscribedToUserIds` - this is who subscribed to `user` - followers
    if (!userUnsubscribeFrom.subscribedToUserIds.includes(currentUserId)) {
      throw fastify.httpErrors.badRequest('User not subscribed to');
    }

    removeArrayItem(userUnsubscribeFrom.subscribedToUserIds, currentUserId);

    await fastify.db.users.change(unsubscribeFromUserId, userUnsubscribeFrom);

    return currentUser;
  }
};

export { unsubscribeUserFromQuery };
