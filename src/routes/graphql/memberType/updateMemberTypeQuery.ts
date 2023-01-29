import {FastifyInstance} from "fastify";
import {GraphQLString} from "graphql";
import {memberTypeUpdateInput} from "./memberTypeUpdateInput";
import {memberTypeType} from "./memberTypeType";

const updateMemberTypeQuery = {
  type: memberTypeType,
  args: {
    memberTypeId: { type: GraphQLString },
    memberType: { type: memberTypeUpdateInput }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    const id = args.memberTypeId;
    const memberType = await fastify.db.memberTypes.findOne({key: 'id', equals: id});

    if (memberType === null) {
      throw fastify.httpErrors.badRequest('Member type not found');
    }

    const updatedMemberType = await fastify.db.memberTypes.change(id, args.memberType);

    return updatedMemberType!;
  }
};

export { updateMemberTypeQuery };
