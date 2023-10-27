import Game from "./game";

export default class GameInstances {
  constructor(public running: Game[] = []) {}

  public async new(game: Game) {
    this.running.push(game)

    return this.running
  }
}
