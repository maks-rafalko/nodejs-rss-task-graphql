import { GraphQLInputObjectType, GraphQLInt } from 'graphql';

const memberTypeUpdateInput = new GraphQLInputObjectType({
  name: 'MemberTypeUpdateInput',
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  })
});

export { memberTypeUpdateInput };
