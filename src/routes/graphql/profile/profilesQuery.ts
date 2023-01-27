import {GraphQLList} from 'graphql';
import {FastifyInstance} from 'fastify';
import {profileType} from './profileType';

const profilesQuery = {
  type: new GraphQLList(profileType),
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    return await fastify.db.profiles.findMany();
  }
};

export { profilesQuery };
