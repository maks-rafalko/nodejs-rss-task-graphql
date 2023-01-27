import {GraphQLID, GraphQLObjectType, GraphQLString} from 'graphql';

const postType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  }
});

export { postType };
