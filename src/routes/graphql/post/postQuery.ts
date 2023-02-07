import { GraphQLString } from 'graphql';
import { postType } from './postType';
import { ContextValueType } from '../ContextValueType';

const postQuery = {
  type: postType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.loaders.postById.load(args.id);
  }
};

export { postQuery };
