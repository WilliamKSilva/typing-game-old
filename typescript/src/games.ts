type Game = {
  id: string
  name: string
  player_one: {
    name: string
    buff: string
  } 
  player_two: {
    name: string
    buff: string
  } 
}

export default class Games {
  public running: Game[] = []

  public create(name: string, player: string) {
    this.running.push({
      id: "",
      name,
      player_one: {
        name,
        buff: ''
      },
      player_two: {
        name: '',
        buff: ''
      }
    })
  }
}