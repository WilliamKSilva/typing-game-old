import Game from "./game";

export default class GameInstances {
  public running: Game[] = []

  public new(game: Game) {
    this.running.push(game);

    return this.running;
  }

  public find(gameId: string) {
    const game = this.running.find((game) => game.id === gameId);

    return game;
  }
}