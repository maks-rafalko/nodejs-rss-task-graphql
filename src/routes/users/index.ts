import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import {removeArrayItem} from "../../utils/removeArrayItem";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const { id } = request.params;
        const user = await fastify.db.users.findOne(id);

        if (user === null) {
            throw fastify.httpErrors.notFound();
        }

        return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const user = await fastify.db.users.create(request.body);

        return user;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const { id } = request.params;
        const user = await fastify.db.users.findOne(id);

        if (user === null) {
            throw fastify.httpErrors.notFound();
        }

        for (const subscribedToUserId of user.userSubscribedToIds) {
            const subscribedToUser = await fastify.db.users.findOne(subscribedToUserId);

            if (subscribedToUser === null) {
                throw fastify.httpErrors.internalServerError();
            }

            removeArrayItem(subscribedToUser.subscribedToUserIds, id);

            await fastify.db.users.change(subscribedToUser.id, subscribedToUser);
        }

        for (const postId of user.postIds) {
            await fastify.db.posts.delete(postId);
        }

        if (user.profileId !== null) {
            await fastify.db.profiles.delete(user.profileId);
        }

        await fastify.db.users.delete(id);

        return user;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const { id } = request.params;
        const { userId: userIdSubscribeTo } = request.body;

        const user = await fastify.db.users.findOne(id);

        if (user === null) {
            throw fastify.httpErrors.notFound();
        }

        const userSubscribeTo = await fastify.db.users.findOne(userIdSubscribeTo);

        if (userSubscribeTo === null) {
            throw fastify.httpErrors.notFound();
        }

        if (user.userSubscribedToIds.includes(userIdSubscribeTo)) {
            throw fastify.httpErrors.badRequest();
        }

        user.userSubscribedToIds.push(userIdSubscribeTo);
        userSubscribeTo.subscribedToUserIds.push(id);

        await fastify.db.users.change(id, user);
        await fastify.db.users.change(userIdSubscribeTo, userSubscribeTo);

        return user;
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const { id } = request.params;
        const { userId: userIdUnsubscribeFrom } = request.body;

        const user = await fastify.db.users.findOne(id);

        if (user === null) {
            throw fastify.httpErrors.notFound();
        }

        const userUnsubscribeFrom = await fastify.db.users.findOne(userIdUnsubscribeFrom);

        if (userUnsubscribeFrom === null) {
            throw fastify.httpErrors.notFound();
        }

        if (!user.userSubscribedToIds.includes(userIdUnsubscribeFrom)) {
            throw fastify.httpErrors.badRequest();
        }

        removeArrayItem(user.userSubscribedToIds, userIdUnsubscribeFrom);
        removeArrayItem(userUnsubscribeFrom.subscribedToUserIds, id);

        await fastify.db.users.change(id, user);
        await fastify.db.users.change(userIdUnsubscribeFrom, userUnsubscribeFrom);

        return user;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const { id } = request.params;
        const user = await fastify.db.users.findOne(id);

        if (user === null) {
            throw fastify.httpErrors.notFound();
        }

        const changedUser = await fastify.db.users.change(id, request.body);

        return changedUser!;
    }
  );
};

export default plugin;
