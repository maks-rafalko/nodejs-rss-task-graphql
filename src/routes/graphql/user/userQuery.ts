import { userType } from './userType';
import { GraphQLString } from 'graphql';
import { ContextValueType } from '../ContextValueType';

const userQuery = {
  type: userType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.loaders.userById.load(args.id);
  }
};

export { userQuery };
