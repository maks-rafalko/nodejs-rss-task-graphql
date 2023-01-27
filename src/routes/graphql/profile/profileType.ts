import {GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';

const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLString },
  }
});

export { profileType };
