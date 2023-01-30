import { FastifyInstance } from 'fastify';
import { Loaders } from './Loaders';
import * as DataLoader from 'dataloader';
import { PostEntity } from '../../utils/DB/entities/DBPosts';
import * as lodash from 'lodash';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const createDataLoaders = (fastify: FastifyInstance): Loaders => {
  const postsByUserId = new DataLoader<string, PostEntity[]>(async (userIds: readonly string[]): Promise<PostEntity[][]> => {
    const posts = await fastify.db.posts.findMany({key: 'userId', equalsAnyOf: userIds as string[]});

    const groupedByUserId = lodash.groupBy(posts, 'userId');

    return userIds.map(userId => groupedByUserId[userId] ?? []);
  });

  const userById = new DataLoader<string, UserEntity>(async (userIds: readonly string[]): Promise<UserEntity[]> => {
    const users = await fastify.db.users.findMany({key: 'id', equalsAnyOf: userIds as string[]});

    const usersById: Record<string, UserEntity> = {};

    for (const user of users) {
      usersById[user.id] = user;
    }

    return userIds.map(userId => usersById[userId] ?? null);
  });

  const usersBySubscribedToUserIds = new DataLoader<string, UserEntity[]>(async (userIds: readonly string[]): Promise<UserEntity[][]> => {
    const users = await fastify.db.users.findMany({key: 'subscribedToUserIds', inArrayAnyOf: userIds as string[]});

    const usersBySubscribedToUserIds: Record<string, UserEntity[]> = {};

    for (const userId of userIds) {
      for (const user of users) {
        if (user.subscribedToUserIds.includes(userId)) {
          if (!usersBySubscribedToUserIds.hasOwnProperty(userId)) {
            usersBySubscribedToUserIds[userId] = [];
          }
          usersBySubscribedToUserIds[userId] = [user, ...usersBySubscribedToUserIds[userId]];
        }
      }
    }

    return userIds.map(userId => usersBySubscribedToUserIds[userId] ?? []);
  });

  const profilesByUserId = new DataLoader<string, ProfileEntity[]>(async (userIds: readonly string[]): Promise<ProfileEntity[][]> => {
    const profiles = await fastify.db.profiles.findMany({key: 'userId', equalsAnyOf: userIds as string[]});

    const groupedByUserId = lodash.groupBy(profiles, 'userId');

    return userIds.map(userId => groupedByUserId[userId] ?? []);
  });

  const memberTypeById = new DataLoader<string, MemberTypeEntity>(async (memberTypeIds: readonly string[]): Promise<MemberTypeEntity[]> => {
    const memberTypes: MemberTypeEntity[] = await fastify.db.memberTypes.findMany({key: 'id', equalsAnyOf: memberTypeIds as string[]});

    const memberTypesById: Record<string, MemberTypeEntity> = {};

    for (const memberType of memberTypes) {
      memberTypesById[memberType.id] = memberType;
    }

    return memberTypeIds.map(memberTypeId => memberTypesById[memberTypeId] ?? null);
  });

  return {
    userById,
    usersBySubscribedToUserIds,
    postsByUserId,
    profilesByUserId,
    memberTypeById,
    populateUserCache: (users: UserEntity[]): void => {
      for (const user of users) {
        userById.prime(user.id, user);
      }
    },
    populateMemberTypeCache: (memberTypes: MemberTypeEntity[]): void => {
      for (const memberType of memberTypes) {
        memberTypeById.prime(memberType.id, memberType);
      }
    }
  }
}

export { createDataLoaders };
