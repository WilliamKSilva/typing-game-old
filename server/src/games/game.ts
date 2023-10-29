import { v4 as uuid } from "uuid";
import Player from "./player";

export enum GameStatus {
  awaiting = "awaiting",
  started = "started",
  finished = "finished",
}

type NewGameData = {
  name: string;
  matchText: string;
};

export type GameState = {
  id: string;
  status: GameStatus;
  matchText: string;
  player: Player | null;
  opponent: Player | null;
};

export default class Game {
  constructor({ name, matchText }: NewGameData) {
    this.id = uuid();
    this.name = name;
    this.matchText = matchText;
    this.status = GameStatus.awaiting;
  }

  public id: string;
  public status: GameStatus;
  public name: string;
  public matchText: string;
  public playerOne?: Player;
  public playerTwo?: Player;

  public newPlayer(player: Player) {
    if (!this.playerOne) {
      this.playerOne = player;

      return this.playerOne;
    }

    this.playerTwo = player;

    return this.playerTwo;
  }

  public getGameState(playerName?: string): GameState {
    if (!playerName) {
      return {
        id: this.id,
        status: this.status,
        matchText: this.matchText,
        player: null,
        opponent: null,
      };
    }

    if (!this.playerOne) {
      return {
        id: this.id,
        status: this.status,
        matchText: this.matchText,
        player: null,
        opponent: null,
      };
    }

    if (this.playerOne.name === playerName) {
      const player: Player = {
        name: this.playerOne.name,
        buff: this.playerOne.buff,
        ready: this.playerOne.ready,
        socket: this.playerOne.socket,
      };

      if (!this.playerTwo) {
        return {
          id: this.id,
          status: this.status,
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
        status: this.status,
        matchText: this.matchText,
        player,
        opponent,
      };
    }

    if (!this.playerTwo) {
      return {
        id: this.id,
        status: this.status,
        matchText: this.matchText,
        player: null,
        opponent: this.playerOne,
      };
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
      status: this.status,
      matchText: this.matchText,
      player,
      opponent,
    };
  }
}
