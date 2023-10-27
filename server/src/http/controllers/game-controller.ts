import { Request, Response } from "express";
import Game from "../../games/game";
import GameInstances from "../../games/instances";
import Player from "../../games/player";
import { CreateGame } from "../types/game-controller-types";

export default class GameController {
  constructor(private gameInstances: GameInstances) {}

  public async create(req: Request, res: Response) {
    const createGameData = req.body as CreateGame;

    const playerOne = new Player({
      name: createGameData.playerName
    })

    const game = new Game({
      name: createGameData.gameName,
      matchText: "",
      playerOne
    }) 

    this.gameInstances.new(game)

    res.status(200).send({
      game
    })
  }
}
