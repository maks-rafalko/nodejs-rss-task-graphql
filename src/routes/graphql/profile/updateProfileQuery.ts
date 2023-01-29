import {FastifyInstance} from "fastify";
import {profileType} from "./profileType";
import {GraphQLString} from "graphql";
import {isUuid} from "../../../utils/isUuid";
import {profileUpdateInput} from "./profileUpdateInput";

const updateProfileQuery = {
  type: profileType,
  args: {
    profileId: { type: GraphQLString },
    profile: { type: profileUpdateInput }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    const id = args.profileId;

    if (!isUuid(id)) {
      throw fastify.httpErrors.badRequest('Profile id is not a valid uuid');
    }

    const profile = await fastify.db.profiles.findOne({key: 'id', equals: id});

    if (profile === null) {
      throw fastify.httpErrors.notFound('Profile not found');
    }

    const updatedProfile = await fastify.db.profiles.change(id, args.profile);

    return updatedProfile!;
  }
};

export { updateProfileQuery };
