import {GraphQLList} from "graphql";
import {userType} from "./userType";
import {ContextValueType} from "../ContextValueType";
import {UserEntity} from "../../../utils/DB/entities/DBUsers";

const usersQuery = {
  type: new GraphQLList(userType),
  resolve: async (_: any, args: any, context: ContextValueType) => {
    const allUsers: UserEntity[] = await context.fastify.db.users.findMany();

    context.loaders.populateUserCache(allUsers);

    return allUsers;
  }
};

export { usersQuery}
