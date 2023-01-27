import {GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString} from 'graphql';
import {postType} from "../post/postType";
import {profileType} from "../profile/profileType";
import {memberTypeType} from "../memberType/memberTypeType";

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLInt) },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (user: any, args: any, fastify: any) => {
        return await fastify.db.posts.findMany({key: 'userId', equals: user.id});
      }
    },
    profile: {
      type: new GraphQLList(profileType),
      resolve: async (user: any, args: any, fastify: any) => {
        return await fastify.db.profiles.findMany({key: 'userId', equals: user.id});
      }
    },
    memberType: {
      type: new GraphQLList(memberTypeType),
      resolve: async (user: any, args: any, fastify: any) => {
        const profiles = await fastify.db.profiles.findMany({key: 'userId', equals: user.id});

        if (profiles.length === 0) {
          return Promise.resolve([]);
        }

        return await fastify.db.memberTypes.findMany({key: 'id', equals: profiles[0].memberTypeId});
      }
    }
  }
});

export { userType };
