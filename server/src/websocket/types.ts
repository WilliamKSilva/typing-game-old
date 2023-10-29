import Game, { GameState } from "../games/game";
import Player from "../games/player";

export enum Events {
  ready = "ready",
  error = "error",
  join = "join",
  state = "state"
}

export type ReadyEvent = {
  ready: boolean;
};

export type StateEvent = GameState 

export type JoinEvent = {
  playerName: string
};

export type ErrorEvent = {
  message: string
};

export type ConnectionData = {
  game: Game
  player?: Player
  requestUrl: string
}