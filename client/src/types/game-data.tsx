type Player = {
  name: string
  buff: string
  ready: boolean
}

export enum GameStatus {
  awaiting = "awaiting",
  started = "started",
  finished = "finished"
}

export type GameData = {
  id: string
  status?: GameStatus
  match_text: string
  player: Player
  opponent: Player 
}

export type GameState = {
  id: string;
  status: GameStatus
  matchText: string;
  player: Player | null;
  opponent: Player | null;
};

export type OpponentTextState = {
  opponent_buff: string
}