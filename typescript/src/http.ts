import { IncomingMessage, ServerResponse } from "http";
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

  private async body(callback: (msg: string) => void) {
    let buff = "";
    this.req.on("data", (chunk) => {
      buff += chunk;
    });

    this.req.on("end", () => {
      callback(buff);
    });
  }

  public write_and_close() {
    const response = {
      message: "ok",
    };

    this.res.write(JSON.stringify(response));
    this.res.end();
  }

  // Bad name, but makes sense I think
  public redirect() {
    if (!this.req.url) {
      throw new Error("Internal server error")
    }

    if (!this.routes.includes(this.req.url)) {
      throw new Error("Not found")
    }

    console.log(this.req.url);
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
