import { Router } from "express";
import GameInstances from "../../games/instances";
import GameController from "../controllers/game-controller";

export const newGameRouter = (gameInstances: GameInstances) => {
  const gamesRouter = Router()
  const gameController = new GameController(gameInstances)

  gamesRouter.post("/", gameController.create)
  gamesRouter.patch("/new-game/:gameId", gameController.newPlayer)

  return gamesRouter
}