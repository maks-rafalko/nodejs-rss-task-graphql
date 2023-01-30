import {FastifyInstance} from "fastify";
import {Loaders} from "./Loaders";

type ContextValueType = {
  fastify: FastifyInstance;
  loaders: Loaders
}

export { ContextValueType };
