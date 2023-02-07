import { GraphQLList } from 'graphql';
import { memberTypeType } from './memberTypeType';
import { ContextValueType } from '../ContextValueType';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';

const memberTypesQuery = {
  type: new GraphQLList(memberTypeType),
  resolve: async (_: any, args: any, context: ContextValueType): Promise<MemberTypeEntity[]> => {
    const memberTypes: MemberTypeEntity[] = await context.fastify.db.memberTypes.findMany();

    context.loaders.populateMemberTypeCache(memberTypes);

    return memberTypes;
  }
};

export { memberTypesQuery };
