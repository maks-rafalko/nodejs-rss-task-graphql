import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { isUuid } from '../../utils/isUuid';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
      return await fastify.db.posts.findMany();
  });

  fastify.get(
      '/:id',
      {schema: {params: idParamSchema}},
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;
      const post = await fastify.db.posts.findOne({key: 'id', equals: id});

      if (post === null) {
        throw fastify.httpErrors.notFound();
      }

      return post;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { userId } = request.body;

      if (!isUuid(userId)) {
        throw fastify.httpErrors.badRequest();
      }

      const user = await fastify.db.users.findOne({key: 'id', equals: userId});

      if (user === null) {
        throw fastify.httpErrors.badRequest();
      }

      const post = await fastify.db.posts.create(request.body);

      return post;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;

      if (!isUuid(id)) {
        throw fastify.httpErrors.badRequest();
      }

      const post = await fastify.db.posts.findOne({key: 'id', equals: id});

      if (post === null) {
        throw fastify.httpErrors.notFound();
      }

      await fastify.db.posts.delete(id);

      return post;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;

      if (!isUuid(id)) {
        throw fastify.httpErrors.badRequest();
      }

      const post = await fastify.db.posts.findOne({key: 'id', equals: id});

      if (post === null) {
        throw fastify.httpErrors.notFound();
      }

      const changed = await fastify.db.posts.change(id, request.body);

      return changed!;
    }
  );
};

export default plugin;
