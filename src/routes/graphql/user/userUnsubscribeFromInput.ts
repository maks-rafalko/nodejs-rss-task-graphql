import { GraphQLInputObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

const userUnsubscribeFromInput = new GraphQLInputObjectType({
  name: 'UserUnsubscribeFromInput',
  fields: () => ({
    currentUserId: { type: new GraphQLNonNull(GraphQLID) },
    unsubscribeFromUserId: { type: new GraphQLNonNull(GraphQLID) },
  })
});

export { userUnsubscribeFromInput };
