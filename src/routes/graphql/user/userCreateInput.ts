import { GraphQLString, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

const userCreateInput = new GraphQLInputObjectType({
  name: 'UserCreateInput',
  fields: () => ({
    firstName: { type:  new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  })
});

export { userCreateInput };
