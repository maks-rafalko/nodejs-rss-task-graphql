import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import {isUuid} from "../../utils/isUuid";
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
      const user = await fastify.db.users.findOne({key: 'id', equals: id});

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

      if (!isUuid(id)) {
        throw fastify.httpErrors.badRequest();
      }

      const user = await fastify.db.users.findOne({key: 'id', equals: id});

      if (user === null) {
        throw fastify.httpErrors.notFound();
      }

      const usersWhoSubscribedToDeletedUser = await fastify.db.users.findMany({key: 'subscribedToUserIds', inArray: id});

      for (const userWhoSubscribedToDeletedUser of usersWhoSubscribedToDeletedUser) {
        removeArrayItem(userWhoSubscribedToDeletedUser.subscribedToUserIds, id);

        await fastify.db.users.change(userWhoSubscribedToDeletedUser.id, userWhoSubscribedToDeletedUser);
      }

      const postsOfDeletedUsers = await fastify.db.posts.findMany({key: 'userId', equals: id});

      for (const post of postsOfDeletedUsers) {
          await fastify.db.posts.delete(post.id);
      }

      const profilesOfDeletedUsers = await fastify.db.profiles.findMany({key: 'userId', equals: id});

      for (const profile of profilesOfDeletedUsers) {
        await fastify.db.profiles.delete(profile.id);
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

      const user = await fastify.db.users.findOne({key: 'id', equals: id});

      if (user === null) {
        throw fastify.httpErrors.notFound();
      }

      const userSubscribeTo = await fastify.db.users.findOne({key: 'id', equals: userIdSubscribeTo});

      if (userSubscribeTo === null) {
        throw fastify.httpErrors.notFound();
      }

      if (userSubscribeTo.subscribedToUserIds.includes(id)) {
        throw fastify.httpErrors.badRequest();
      }

      userSubscribeTo.subscribedToUserIds.push(id);

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
      const { id: userIdUnsubscribeFrom } = request.params;
      const { userId } = request.body;

      const userUnsubscribeFrom = await fastify.db.users.findOne({key: 'id', equals: userIdUnsubscribeFrom});

      if (userUnsubscribeFrom === null) {
        throw fastify.httpErrors.notFound();
      }

      const user = await fastify.db.users.findOne({key: 'id', equals: userId});

      if (user === null) {
        throw fastify.httpErrors.notFound();
      }

      // `subscribedToUserIds` - this is who subscribed to `user` - followers
      if (!user.subscribedToUserIds.includes(userIdUnsubscribeFrom)) {
        throw fastify.httpErrors.badRequest();
      }

      removeArrayItem(user.subscribedToUserIds, userIdUnsubscribeFrom);

      await fastify.db.users.change(userId, user);

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

      if (!isUuid(id)) {
        throw fastify.httpErrors.badRequest();
      }

      const user = await fastify.db.users.findOne({key: 'id', equals: id});

      if (user === null) {
        throw fastify.httpErrors.notFound();
      }

      const changedUser = await fastify.db.users.change(id, request.body);

      return changedUser!;
    }
  );
};

export default plugin;
