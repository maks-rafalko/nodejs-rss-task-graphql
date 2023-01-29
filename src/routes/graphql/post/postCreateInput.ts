import {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} from 'graphql';

const postCreateInput = new GraphQLInputObjectType({
  name: 'PostCreateInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type:  new GraphQLNonNull(GraphQLString) },
    userId: { type:  new GraphQLNonNull(GraphQLString) },
  })
});

export { postCreateInput };
