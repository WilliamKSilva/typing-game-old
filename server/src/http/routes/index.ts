import { Router } from "express";
import GameInstances from "../../games/instances";
import { newGameRouter } from "./games-routes";

export const newRouter = (gameInstances: GameInstances) => {
  const router = Router();
  router.use("/games", newGameRouter(gameInstances));

  return router
};
