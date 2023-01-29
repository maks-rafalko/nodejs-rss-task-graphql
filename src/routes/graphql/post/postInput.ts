import {GraphQLString, GraphQLInputObjectType} from 'graphql';

const postInput = new GraphQLInputObjectType({
  name: 'PostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  })
});

export { postInput };
