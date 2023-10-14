type Player = {
  name: string
  buff: string
}

export type GameData = {
  id: string
  match_text: string
  player: Player
  opponent: Player 
}