import {GraphQLString, GraphQLInputObjectType, GraphQLInt} from 'graphql';

const profileInput = new GraphQLInputObjectType({
  name: 'ProfileInput',
  fields: () => ({
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    userId: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
  })
});

export { profileInput };
