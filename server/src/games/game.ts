import { v4 as uuid } from "uuid";
import { Player } from "../games";

export enum GameStatus {
  awaiting = "awaiting",
  started = "started",
  finished = "finished",
}

type NewGameData = {
  name: string;
  matchText: string;
  playerOne: Player;
};

type GameState = {
  id: string;
  matchText: string;
  player: Player | null;
  opponent: Player | null;
};

export default class Game {
  constructor({ name, matchText, playerOne }: NewGameData) {
    this.id = uuid();
    this.name = name;
    this.matchText = matchText;
    this.playerOne = playerOne;
    this.playerTwo = null;
    this.gameStatus = GameStatus.awaiting;
  }

  public id: string;
  public name: string;
  public matchText: string;
  public gameStatus: GameStatus;
  public playerOne: Player | null;
  public playerTwo?: Player | null;

  public getGameState(connectedPlayer: Player): GameState {
    if (!this.playerOne) {
      return {
        id: this.id,
        matchText: this.matchText,
        player: null,
        opponent: null,
      };
    }

    if (this.playerOne.name === connectedPlayer.name) {
      const player: Player = {
        name: this.playerOne.name,
        buff: this.playerOne.buff,
        ready: this.playerOne.ready,
        socket: this.playerOne.socket,
      };

      if (!this.playerTwo) {
        return {
          id: this.id,
          matchText: this.matchText,
          player,
          opponent: null,
        };
      }

      const opponent: Player = {
        name: this.playerTwo.name,
        buff: this.playerTwo.buff,
        ready: this.playerTwo.ready,
        socket: this.playerTwo.socket,
      };

      return {
        id: this.id,
        matchText: this.matchText,
        player,
        opponent,
      };
    }

    if (!this.playerTwo) {
      return {
        id: this.id,
        matchText: this.matchText,
        player: null,
        opponent: this.playerOne
      }
    }

    const player: Player = {
      name: this.playerTwo.name,
      buff: this.playerTwo.buff,
      ready: this.playerTwo.ready,
      socket: this.playerTwo.socket,
    };

    const opponent: Player = {
      name: this.playerOne.name,
      buff: this.playerOne.buff,
      ready: this.playerOne.ready,
      socket: this.playerOne.socket,
    };

    return {
      id: this.id,
      matchText: this.matchText,
      player,
      opponent,
    };
  }
}
