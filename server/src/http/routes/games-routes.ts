import { Router } from "express";
import GameInstances from "../../games/instances";
import { TextGeneratorContract } from "../../games/text-generator";
import GameController from "../controllers/game-controller";

export const newGameRouter = (gameInstances: GameInstances, textGenerator: TextGeneratorContract) => {
  const gameController = new GameController(gameInstances, textGenerator)
  const gamesRouter = Router()

  gamesRouter.post("/", (req, res) => gameController.create(req, res))

  return gamesRouter
}