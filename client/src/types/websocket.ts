import { GameState } from "./game-data"


export type SocketEvent<T> = {
  type: string 
  data: T 
}

export type GenericSocketEvent = {
  type: Events
}

export type JoinEvent = {
  playerName: string
};

export type StateEvent = GameState

export enum Events {
  state = "state",
  join = "join"
} 