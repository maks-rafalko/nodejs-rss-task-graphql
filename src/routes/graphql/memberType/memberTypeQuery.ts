import {GraphQLString} from "graphql";
import {memberTypeType} from "./memberTypeType";
import {ContextValueType} from "../ContextValueType";

const memberTypeQuery = {
  type: memberTypeType,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_: any, args: any, context: ContextValueType) => {
    return await context.loaders.memberTypeById.load(args.id);
  }
};

export { memberTypeQuery };
