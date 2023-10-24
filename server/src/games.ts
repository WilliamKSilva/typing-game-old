import { v4 as uuid } from "uuid";
import WebSocket from "ws";
import { TextGeneratorContract } from "./services/random_text";

export type Player = {
  name: string;
  buff: string;
  socket: WebSocket | null;
};

type Game = {
  id: string;
  name: string;
  match_text: string;
  player_one: Player;
  player_two: Player;
};

export type GameState = {
  id: string
  match_text: string
  player: Omit<Player, "socket"> 
  opponent: Omit<Player, "socket"> 
}

export default class Games {
  constructor(private textGenerator: TextGeneratorContract) {}
  public running: Game[] = [];

  public create(name: string, player: string) {
    const game: Game = {
      id: uuid(),
      name,
      match_text: this.textGenerator.random(),
      player_one: {
        name: player,
        buff: "",
        socket: null,
      },
      player_two: {
        name: "",
        buff: "",
        socket: null,
      },
    };

    this.running.push(game);

    const game_data = {
      id: game.id,
      player: game.player_one,
      opponent: game.player_two,
    };

    return game_data;
  }

  public update_player_socket(player: Player, socket: WebSocket) {
    player.socket = socket;
  }

  public find_by_id(id: string): Game | null {
    const game = this.running.find((game) => game.id === id);

    if (!game) {
      return null;
    }

    return game;
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

  public game_state(game: Game, player: Player, opponent: Player): [GameState | null, GameState | null] {
    if (opponent.name) {
      const player_state: GameState = {
        id: game.id,
        match_text: game.match_text,
        player: {
          name: player.name,
          buff: player.buff,
        },
        opponent: {
          name: opponent.name,
          buff: opponent.buff,
        },
      };

      const opponent_state: GameState = {
        id: game.id,
        match_text: game.match_text,
        player: {
          name: opponent.name,
          buff: opponent.buff,
        },
        opponent: {
          name: player.name,
          buff: player.buff,
        },
      };

      return [player_state, opponent_state]
    }

    return [null, null];
  }

  // I think that is bad to pass the socket instance to the Games class
  // Will refactor later

  public update_opponent_state(opponent: Player, socket: WebSocket) {
    const state = {
      opponent: opponent.buff,
    };

    socket.send(Buffer.from(JSON.stringify(state)));

    return;
  }

  // public check_game_ready(game: Game, player: Player, opponent: Player, socket: WebSocket) {
  //   const game_state = this.game_state(game, player, opponent)
  //   if (opponent?.name !== "" && !game?.ready) {
  //     game.ready = true;

  //     socket.send(Buffer.from(JSON.stringify(game_state)));
  //   } else {
  //     socket.send(Buffer.from(JSON.stringify(game_state)));
  //   }
  // }
}
