import { GraphQLID, GraphQLInt, GraphQLObjectType } from 'graphql';

const memberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLID },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }
});

export { memberTypeType };
