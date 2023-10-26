import { IncomingMessage, ServerResponse } from "http";
import { InternalServerError, NotFoundError } from "./exceptions";
import Games, { GameState } from "./games";

type NewGameData = {
  name: string;
  player: string;
};

type FindGameData = {
  game_id: string;
  player: string;
};

type ResponseData = Record<string, unknown> | null;

export default class Http {
  constructor(
    private req: IncomingMessage,
    private res: ServerResponse,
    private games: Games,
    private routes: string[] = ["/games/new", "/games/update"],
  ) {}

  private body(callback: (msg: string) => void) {
    let buff = "";
    this.req.on("data", (chunk) => {
      buff += chunk;
    });

    this.req.on("end", () => {
      callback(buff);
    });
  }

  public response<T>(json: T): string {
    const body = JSON.stringify(json);
    return body;
  }

  public write_and_close(response: string, status_code: number) {
    this.res.statusCode = status_code;
    this.res.write(response);
    this.res.end();
  }

  // Bad name, but makes sense I think
  public redirect(response: (response_data: ResponseData) => void) {
    if (!this.req.url) {
      throw new InternalServerError();
    }

    if (!this.routes.includes(this.req.url)) {
      throw new NotFoundError();
    }

    switch (this.req.url) {
      case "/games/update":
        this.body((body) => {
          if (!body) {
            throw new Error("Empty body");
          }

          const data = JSON.parse(body) as FindGameData;

          const game = this.games.find_by_id(data.game_id);

          if (!game) {
            response(null)

            return
          }

          game.player_two = {
            name: data.player,
            ready: false,
            buff: "",
            socket: null
          } 

          const game_data: GameState = {
            id: game.id,
            status: game.status, 
            match_text: game.match_text,
            player: game.player_one,
            opponent: game.player_one
          }

          response(game_data);
        });

        break;
      case "/games/new":
        this.body((body) => {
          if (!body) {
            throw new Error("Empty body");
          }

          const data = JSON.parse(body) as NewGameData;
          const created_game = this.games.create(data.name, data.player);

          response(created_game);
        });

        break;
      default:
        response(null);
    }
  }
}
