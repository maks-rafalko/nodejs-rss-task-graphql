import { userCreateInput } from './userCreateInput';
import { userType } from './userType';
import { ContextValueType } from '../ContextValueType';

const createUserQuery = {
  type: userType,
  args: {
    user: { type: userCreateInput }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    const user = await context.fastify.db.users.create(args.user);

    return user;
  }
};

export { createUserQuery };
