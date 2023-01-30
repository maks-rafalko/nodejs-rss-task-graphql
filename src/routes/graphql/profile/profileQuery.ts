import { GraphQLString } from 'graphql';
import { profileType } from './profileType';
import { ContextValueType } from '../ContextValueType';

const profileQuery = {
  type: profileType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.fastify.db.profiles.findOne({key: 'id', equals: args.id});
  }
};

export { profileQuery };
