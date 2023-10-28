import { Router } from "express";
import GameInstances from "../../games/instances";
import GameController from "../controllers/game-controller";

export const newGameRouter = (gameInstances: GameInstances) => {
  const gameController = new GameController(gameInstances)
  const gamesRouter = Router()

  gamesRouter.post("/", (req, res) => gameController.create(req, res))
  gamesRouter.post("/new-game/:gameId", (req, res) => gameController.newPlayer(req, res))

  return gamesRouter
}