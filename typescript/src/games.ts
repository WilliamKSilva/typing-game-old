type Game = {
  id: string
  name: string
  player_one: string
  player_two: string
}

export default class Games {
  public running: Game[] = []

  public create(name: string, player: string) {
    this.running.push({
      id: "",
      name,
      player_one: player,
      player_two: ""
    })
  }
}