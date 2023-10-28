import { Request, Response } from "express";
import Game from "../../games/game";
import GameInstances from "../../games/instances";
import Player from "../../games/player";
import { CreateGameData, UpdateGameData } from "../types/game-controller-types";

export default class GameController {
  constructor(private gameInstances: GameInstances) {}

  public create(req: Request, res: Response) {
    try {
      const createGameData = req.body as CreateGameData;

      const playerOne = new Player({
        name: createGameData.playerName,
      });

      const game = new Game({
        name: createGameData.gameName,
        matchText: "",
        playerOne,
      });

      this.gameInstances.new(game);

      const gameState = game.getGameState(playerOne) 

      res.status(200).send(gameState);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal server error",
      });
    }
  }

  public newPlayer(req: Request, res: Response) {
    const { gameId } = req.params;
    const updateGameData = req.body as UpdateGameData;

    const game = this.gameInstances.find(gameId);

    if (!game) {
      res.status(400).send({
        message: "Game not found",
      });

      return;
    }

    const player = new Player({
      name: updateGameData.playerName,
    });

    game.playerTwo = player;

    res.status(200).send({
      message: "Game updated",
    });
  }
}
