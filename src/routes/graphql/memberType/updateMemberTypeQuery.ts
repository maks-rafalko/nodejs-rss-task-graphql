import { GraphQLString } from 'graphql';
import { memberTypeUpdateInput } from './memberTypeUpdateInput';
import { memberTypeType } from './memberTypeType';
import { ContextValueType } from '../ContextValueType';
import { FastifyInstance } from 'fastify';

const updateMemberTypeQuery = {
  type: memberTypeType,
  args: {
    memberTypeId: { type: GraphQLString },
    memberType: { type: memberTypeUpdateInput }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    const id = args.memberTypeId;
    const fastify: FastifyInstance = context.fastify;

    const memberType = await context.loaders.memberTypeById.load(id);

    if (memberType === null) {
      throw fastify.httpErrors.badRequest('Member type not found');
    }

    const updatedMemberType = await fastify.db.memberTypes.change(id, args.memberType);

    return updatedMemberType!;
  }
};

export { updateMemberTypeQuery };
