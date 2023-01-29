import { GraphQLInputObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

const userSubscribeToInput = new GraphQLInputObjectType({
  name: 'UserSubscribeToInput',
  fields: () => ({
    currentUserId: { type: new GraphQLNonNull(GraphQLID) },
    subscribeToUserId: { type: new GraphQLNonNull(GraphQLID) },
  })
});

export { userSubscribeToInput };
