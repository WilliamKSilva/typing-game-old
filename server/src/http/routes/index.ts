import { Router } from "express";
import GameInstances from "../../games/instances";
import { TextGeneratorContract } from "../../games/text-generator";
import { newGameRouter } from "./games-routes";

export const newRouter = (gameInstances: GameInstances, textGenerator: TextGeneratorContract) => {
  const router = Router();
  router.use("/games", newGameRouter(gameInstances, textGenerator));

  return router
};
