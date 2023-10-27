import { v4 as uuid } from "uuid";
import { Player } from "../games";

export enum GameStatus {
  awaiting = "awaiting",
  started = "started",
  finished = "finished",
}

type NewGameData = {
  name: string
  matchText: string
  playerOne: Player
}

export default class Game {
  constructor({
    name,
    matchText,
    playerOne,
  }: NewGameData) {
    this.id = uuid()
    this.name = name
    this.matchText = matchText
    this.playerOne = playerOne
    this.playerTwo = null
    this.gameStatus = GameStatus.awaiting 
  } 

  public id: string
  public name: string
  public matchText: string
  public gameStatus: GameStatus
  public playerOne: Player | null
  public playerTwo?: Player | null
}
