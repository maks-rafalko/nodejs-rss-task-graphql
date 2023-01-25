import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import {removeArrayItem} from "../../utils/removeArrayItem";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
        return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
        const { id } = request.params;
        const profile = await fastify.db.profiles.findOne(id);

        if (profile === null) {
            throw fastify.httpErrors.notFound();
        }

        return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
        const { userId } = request.body;

        const user = await fastify.db.users.findOne(userId);

        if (user === null) {
            throw fastify.httpErrors.badRequest();
        }

        if (user.profileId !== null) {
            throw fastify.httpErrors.badRequest();
        }

        const profile = await fastify.db.profiles.create(request.body);

        await fastify.db.users.change(userId, { profileId: profile.id });

        return profile;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
        const { id } = request.params;
        const profile = await fastify.db.profiles.findOne(id);

        if (profile === null) {
            throw fastify.httpErrors.notFound();
        }

        await fastify.db.profiles.delete(id);

        const user = await fastify.db.users.findOne(profile.userId);

        if (user !== null) {
            await fastify.db.users.change(user.id, { profileId: null });
        }

        return profile;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
        const { id } = request.params;
        const profile = await fastify.db.profiles.findOne(id);

        if (profile === null) {
            throw fastify.httpErrors.notFound();
        }

        const previousMemberTypeId = profile.memberTypeId;
        const newMemberTypeId = request.body.memberTypeId;

        const updatedProfile = await fastify.db.profiles.change(id, request.body);

        if (previousMemberTypeId !== undefined
            && newMemberTypeId !== undefined
            && previousMemberTypeId !== newMemberTypeId) {
            const previousMemberType = await fastify.db.memberTypes.findOne(previousMemberTypeId);

            if (previousMemberType === null) {
                throw fastify.httpErrors.internalServerError();
            }

            removeArrayItem(previousMemberType.profileIds, id);

            await fastify.db.memberTypes.change(previousMemberTypeId, previousMemberType);

            const newMemberType = await fastify.db.memberTypes.findOne(newMemberTypeId);

            if (newMemberType === null) {
                throw fastify.httpErrors.internalServerError();
            }

            newMemberType.profileIds.push(id);

            await fastify.db.memberTypes.change(newMemberTypeId, newMemberType);
        }

        return updatedProfile!;
    }
  );
};

export default plugin;
