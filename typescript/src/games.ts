import { v4 as uuid } from "uuid";

type Game = {
  id: string;
  name: string;
  player_one: {
    name: string;
    buff: string;
  };
  player_two: {
    name: string;
    buff: string;
  };
};

export default class Games {
  public running: Game[] = [];

  public create(name: string, player: string) {
    const game = {
      id: uuid(),
      name,
      player_one: {
        name,
        buff: "",
      },
      player_two: {
        name: "",
        buff: "",
      },
    };

    this.running.push(game);

    return game
  }
}
