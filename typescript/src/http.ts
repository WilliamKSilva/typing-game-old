import { IncomingMessage, ServerResponse } from "http";
import { InternalServerError, NotFoundError } from "./exceptions";
import Games from "./games";

type NewGameData = {
  name: string;
  player: string;
};

export default class Http {
  constructor(
    private req: IncomingMessage,
    private res: ServerResponse,
    private games: Games,
    private routes: string[] = ["/games/new"],
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
    const body = JSON.stringify(json)
    return body 
  }

  public write_and_close(response: string, status_code: number) {
    this.res.statusCode = status_code
    this.res.write(response);
    this.res.end();
  }

  // Bad name, but makes sense I think
  public redirect() {
    if (!this.req.url) {
      throw new InternalServerError()
    }

    if (!this.routes.includes(this.req.url)) {
      throw new NotFoundError()
    }

    switch (this.req.url) {
      case "/games/new":
        this.body((body) => {
          if (!body) {
            throw new Error("fuck");
          }

          const data = JSON.parse(body) as NewGameData;
          this.games.create(data.name, data.player);

          return;
        });

        break;
    }
  }
}