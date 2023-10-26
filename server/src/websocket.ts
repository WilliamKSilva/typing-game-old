import console from "console";
import { IncomingMessage } from "http";
import internal from "stream";
import { Server, WebSocketServer } from "ws";
import { GameStatus, default as Games } from "./games";

export type SocketEvent = {
  type: string;
  data?: Record<string, unknown>;
};

export type ReadyEvent = {
  ready: boolean;
};

export default class Websocket {
  private server: Server;
  private games: Games;

  constructor(games: Games) {
    this.server = new WebSocketServer({
      noServer: true,
    });

    this.games = games;

    // Start listening to connections
    this.handleClientConnection();
  }

  // TODO: Move connected socket handling from the connection method (ex: message event)
  private handleClientConnection() {
    this.server.on("connection", (socket, req) => {
      console.log("connection");
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

      if (!game) {
        console.log("socket: closed");
        socket.terminate();
        return;
      }

      // Always save the player socket connections
      // so we can keep track of the state on the client
      this.games.update_player_socket(player, socket);

      // If game_state returns an value the game has the two players connected
      const [player_state, opponent_state] = this.games.game_state(
        game,
        player,
        opponent,
      );

      // If game is full send the state to the two players
      if (player_state && opponent_state) {
        opponent.socket?.send(Buffer.from(JSON.stringify(opponent_state)));
        player.socket?.send(Buffer.from(JSON.stringify(player_state)));
      }

      socket.on("message", (data) => {
        let buff = "";
        buff += data;

        const event = JSON.parse(buff) as SocketEvent;

        // TODO: break this events in separated functions
        if (event.type === "ready") {
          const eventData = event.data as ReadyEvent;
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

          player.ready = eventData.ready;

          const [player_state, opponent_state] = this.games.game_state(
            game,
            player,
            opponent,
          );

          // TODO: what if the player_state and opponent_state are null
          this.games.communicate_game_state(
            player,
            opponent,
            player_state,
            opponent_state,
          );

          if (player.ready && opponent.ready) {
            // TODO: the game status updated is not being sent to the client
            // TODO: change all the state update logic to follow the SocketEvent type format
            game.status = GameStatus.started

            const event: SocketEvent = {
              type: "ready",
            };

            player.socket?.send(Buffer.from(JSON.stringify(event)));
            opponent.socket?.send(Buffer.from(JSON.stringify(event)));
          }

          return;
        }
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
