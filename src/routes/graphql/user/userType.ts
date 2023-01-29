import {GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString} from 'graphql';
import {postType} from "../post/postType";
import {profileType} from "../profile/profileType";
import {memberTypeType} from "../memberType/memberTypeType";
import {FastifyInstance} from "fastify";

// @ts-ignore
const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLInt) },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (user: any, args: any, fastify: FastifyInstance) => {
        return await fastify.db.posts.findMany({key: 'userId', equals: user.id});
      }
    },
    profile: {
      type: profileType,
      resolve: async (user: any, args: any, fastify: FastifyInstance) => {
        return await fastify.db.profiles.findOne({key: 'userId', equals: user.id});
      }
    },
    memberType: {
      type: memberTypeType,
      resolve: async (user: any, args: any, fastify: FastifyInstance) => {
        // todo complete cross-check for remote-control


        // todo Плюсую. Оба пункта, в которых нужно возвращать memberType (2.3 и 2.4) идут вместе с профилем. Технически можно и юзеру добавить нужный резолвер, но через профиль выглядит логичнее
        const profile = await fastify.db.profiles.findOne({key: 'userId', equals: user.id});

        if (profile === null) {
          return Promise.resolve(null);
        }

        return await fastify.db.memberTypes.findOne({key: 'id', equals: profile.memberTypeId});
      }
    },
    // these are users that the current user is following.
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (user: any, args: any, fastify: FastifyInstance) => {
        return await fastify.db.users.findMany({key: 'subscribedToUserIds', inArray: user.id});
      }
    },
    // these are users who are following the current user.
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (user: any, args: any, fastify: FastifyInstance) => {
        return await fastify.db.users.findMany({key: 'id', equalsAnyOf: user.subscribedToUserIds});
      }
    }
  })
});

export { userType };
