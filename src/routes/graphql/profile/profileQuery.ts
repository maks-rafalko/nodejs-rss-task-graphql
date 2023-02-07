import { GraphQLString } from 'graphql';
import { profileType } from './profileType';
import { ContextValueType } from '../ContextValueType';

const profileQuery = {
  type: profileType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.loaders.profileById.load(args.id);
  }
};

export { profileQuery };
