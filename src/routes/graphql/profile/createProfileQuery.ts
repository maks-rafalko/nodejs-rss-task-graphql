import {FastifyInstance} from "fastify";
import {profileType} from "./profileType";
import {profileCreateInput} from "./profileCreateInput";

const createProfileQuery = {
  type: profileType,
  args: {
    profile: { type: profileCreateInput }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    // todo reuse the code with REST
    const { userId, memberTypeId } = args.profile;

    const user = await fastify.db.users.findOne({key: 'id', equals: userId});

    if (user === null) {
      throw fastify.httpErrors.badRequest('User not found');
    }

    const profileByUserId = await fastify.db.profiles.findOne({key: 'userId', equals: userId});

    if (profileByUserId !== null) {
      throw fastify.httpErrors.badRequest('Profile already exists');
    }

    const memberType = await fastify.db.memberTypes.findOne({key: 'id', equals: memberTypeId});

    if (memberType === null) {
      throw fastify.httpErrors.badRequest('Member type not found');
    }

    const profile = await fastify.db.profiles.create(args.profile);

    return profile;
  }
};

export { createProfileQuery };
