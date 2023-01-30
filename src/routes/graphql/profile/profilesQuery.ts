import {GraphQLList} from 'graphql';
import {profileType} from './profileType';
import {ContextValueType} from "../ContextValueType";

const profilesQuery = {
  type: new GraphQLList(profileType),
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.fastify.db.profiles.findMany();
  }
};

export { profilesQuery };
