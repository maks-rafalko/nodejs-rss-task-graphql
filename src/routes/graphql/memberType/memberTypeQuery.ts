import { GraphQLString } from 'graphql';
import { memberTypeType } from './memberTypeType';
import { ContextValueType } from '../ContextValueType';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';

const memberTypeQuery = {
  type: memberTypeType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType): Promise<MemberTypeEntity> => {
    return await context.loaders.memberTypeById.load(args.id);
  }
};

export { memberTypeQuery };
