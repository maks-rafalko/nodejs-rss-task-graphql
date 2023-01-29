import {GraphQLString, GraphQLInputObjectType} from 'graphql';

const postUpdateInput = new GraphQLInputObjectType({
  name: 'PostUpdateInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  })
});

export { postUpdateInput };
