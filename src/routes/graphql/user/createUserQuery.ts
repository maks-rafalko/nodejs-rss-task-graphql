import {userCreateInput} from './userCreateInput';
import {FastifyInstance} from "fastify";
import {userType} from "./userType";

const createUserQuery = {
  type: userType,
  args: {
    user: { type: userCreateInput }
  },
  resolve: async (_: any, args: any, fastify: FastifyInstance) => {
    const user = await fastify.db.users.create(args.user);

    return user;
  }
};

export { createUserQuery };
