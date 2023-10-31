import { Request, Response } from "express";
import Game from "../../games/game";
import GameInstances from "../../games/instances";
import { TextGeneratorContract } from "../../games/text-generator";
import { CreateGameData } from "../types/game-controller-types";

export default class GameController {
  constructor(private gameInstances: GameInstances, private textGenerator: TextGeneratorContract) {}

  public create(req: Request, res: Response) {
    try {
      const createGameData = req.body as CreateGameData;

      const matchText = this.textGenerator.random()

      const game = new Game({
        name: createGameData.gameName,
        matchText,
      });

      this.gameInstances.new(game);

      const gameState = game.getGameState(null) 

      res.status(200).send(gameState);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal server error",
      });
    }
  }
}
