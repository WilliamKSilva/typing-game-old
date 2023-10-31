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

export type GameStateData = {
  id: string;
  status: GameStatus;
  matchText: string;
  player?: Omit<Player, "socket">;
  opponent?: Omit<Player, "socket">;
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

  public getGameState(connectedPlayer: string | null): GameState {
    console.log("Game State Start!")

    if (!connectedPlayer) {
      return {
        id: this.id,
        status: this.status,
        matchText: this.matchText,
        player: null,
        opponent: null
      }
    }

    console.log("playerOne", this.playerOne)
    console.log("playerTwo", this.playerTwo)

    if (!this.playerOne) {
      return {
        id: this.id,
        status: this.status,
        matchText: this.matchText,
        player: null,
        opponent: null,
      };
    }

    const connectedPlayerIsPlayerOne = this.playerOne.name === connectedPlayer;

    if (connectedPlayerIsPlayerOne) {
      const player: Player = this.playerOne;

      if (!this.playerTwo) {
        return {
          id: this.id,
          status: this.status,
          matchText: this.matchText,
          player,
          opponent: null,
        };
      }

      const opponent: Player = this.playerTwo;

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

    const player: Player = this.playerTwo;

    const opponent: Player = this.playerOne;

    return {
      id: this.id,
      status: this.status,
      matchText: this.matchText,
      player,
      opponent,
    };
  }

  public getGameStateData(connectedPlayerName: string): GameStateData | undefined {
    const { player, opponent, ...gameState } =
      this.getGameState(connectedPlayerName);

    if (!player && opponent) {
      return {
        ...gameState,
        opponent: {
          name: opponent.name,
          buff: opponent.buff,
          ready: opponent.ready,
        },
      };
    }

    if (player && !opponent) {
      return {
        ...gameState,
        player: {
          name: player.name,
          buff: player.buff,
          ready: player.ready,
        },
      };
    }

    // Typescript can't see that all validations for nullability
    // has already being made, so this is necessary
    if (player && opponent) {
      return {
        ...gameState,
        player: {
          name: player.name,
          buff: player.buff,
          ready: player.ready,
        },
        opponent: {
          name: opponent.name,
          buff: opponent.buff,
          ready: opponent.ready,
        },
      };
    }
  }
}