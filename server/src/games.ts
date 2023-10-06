import { v4 as uuid } from "uuid";
import WebSocket from "ws";

type Player = {
  name: string;
  buff: string;
};

type Game = {
  id: string;
  name: string;
  player_one: Player;
  player_two: Player;
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

    return game;
  }

  public find_by_id(id: string): Game | undefined {
    return this.running.find((game) => game.id === id);
  }

  public find_player_and_opponent(
    name: string,
    game_id: string,
  ): [Player | null, Player | null] {
    const game = this.running.find((game) => game.id === game_id);

    if (!game) {
      return [null, null];
    }

    if (game.player_one.name === name) {
      return [game.player_one, game.player_two];
    } else {
      return [game.player_two, game.player_one];
    }
  }

  public update_opponent_state(opponent: Player, socket: WebSocket) {
    const state = {
      opponent: opponent.buff,
    };

    socket.send(Buffer.from(JSON.stringify(state)));

    return;
  }
}
