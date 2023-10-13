import { IncomingMessage } from "http";
import internal from "stream";
import { Server, WebSocketServer } from "ws";
import { default as Games } from "./games";

export default class Websocket {
  private server: Server;
  private games: Games;

  constructor(games: Games) {
    this.server = new WebSocketServer({
      noServer: true,
    });

    this.games = games;

    this.handleClientConnection();
  }

  private handleClientConnection() {
    this.server.on("connection", (socket, req) => {
      let full_url = `http://127.0.0.1:3333${req.url}`;
      const url = new URL(full_url);
      const game_id = url.searchParams.get("id");
      const player_name = url.searchParams.get("player");
      socket.on("error", console.error);

      if (!game_id) {
        console.log("socket: closed");
        socket.terminate();
        return;
      }

      if (!player_name) {
        console.log("socket: closed");
        socket.terminate();
        return;
      }

      const game = this.games.find_by_id(game_id);

      const [player, opponent] = this.games.find_player_and_opponent(
        player_name,
        game_id,
      );

      if (!player) {
        socket.terminate();
        return;
      }

      if (!opponent) {
        socket.terminate();
        return;
      }

      // setTimeout(() => {
      //   this.games.update_opponent_state(opponent, socket);
      // }, 3000);

      if (!game) {
        console.log("socket: closed");
        socket.terminate();
        return;
      }

      const game_data = {
        id: game.id,
        player,
        opponent
      }

      socket.send(Buffer.from(JSON.stringify(game_data)))

      socket.on("message", (data) => {
        let buff = "";
        buff += data;

        console.log(buff)

        player.buff = buff 

        const state = {
          opponent: opponent.buff,
        };

        socket.send(Buffer.from(JSON.stringify(state)));

        return;
      });
    });
  }

  public handleSocketUpgrade(
    request: IncomingMessage,
    socket: internal.Duplex,
    head: Buffer,
  ) {
    const ws_server = this.server;
    ws_server.handleUpgrade(request, socket, head, function done(ws) {
      ws_server.emit("connection", ws, request);
    });
  }
}
