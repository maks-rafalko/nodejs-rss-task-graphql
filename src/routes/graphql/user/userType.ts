import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { postType } from '../post/postType';
import { profileType } from '../profile/profileType';
import { memberTypeType } from '../memberType/memberTypeType';
import { ContextValueType } from '../ContextValueType';
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { MemberTypeEntity } from "../../../utils/DB/entities/DBMemberTypes";

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (user: UserEntity, args: any, context: ContextValueType): Promise<PostEntity[]> => {
        const postsByUserId = context.loaders.postsByUserId;

        return await postsByUserId.load(user.id);
      }
    },
    profile: {
      type: profileType,
      resolve: async (user: UserEntity, args: any, context: ContextValueType): Promise<ProfileEntity | null> => {
        const profilesByUserId = context.loaders.profilesByUserId;

        const profiles = await profilesByUserId.load(user.id);

        return profiles.length === 0 ? null : profiles[0];
      }
    },
    memberType: {
      type: memberTypeType,
      resolve: async (user: UserEntity, args: any, context: ContextValueType): Promise<MemberTypeEntity | null> => {
        const profilesByUserId = context.loaders.profilesByUserId;
        const profiles = await profilesByUserId.load(user.id);

        if (profiles.length === 0) {
          return Promise.resolve(null);
        }

        const memberTypeById = context.loaders.memberTypeById;

        return await memberTypeById.load(profiles[0].memberTypeId);
      }
    },
    // these are users that the current user is following.
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (user: UserEntity, args: any, context: ContextValueType): Promise<UserEntity[]> => {
        const usersBySubscribedToUserIds = context.loaders.usersBySubscribedToUserIds;

        return await usersBySubscribedToUserIds.load(user.id);
      }
    },
    // these are users who are following the current user.
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (user: UserEntity, args: any, context: ContextValueType): Promise<(UserEntity | Error)[]> => {
        const userById = context.loaders.userById;

        return await userById.loadMany(user.subscribedToUserIds);
      }
    }
  })
});

export { userType };
