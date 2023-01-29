import {GraphQLString, GraphQLInputObjectType} from 'graphql';

const userUpdateInput = new GraphQLInputObjectType({
  name: 'UserUpdateInput',
  fields: () => ({
    // todo bug with setting null
    firstName: { type:  GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  })
});

export { userUpdateInput };
