import { IncomingMessage } from "http";
import internal from "stream";
import { Server, WebSocket, WebSocketServer } from "ws";
import Game from "../games/game";
import GameInstances from "../games/instances";
import Player from "../games/player";
import { sendErrorEvent } from "./events";
import { ErrorEvent, Events, JoinEvent, StateEvent } from "./types";

export type GenericSocketEvent = {
  type: Events;
};

export type SocketEvent<T> = {
  type: Events;
  data: T;
};

export default class WebsocketServer {
  private server: Server;
  private gameInstances: GameInstances;

  constructor(gameInstances: GameInstances) {
    this.server = new WebSocketServer({
      noServer: true,
    });

    this.gameInstances = gameInstances;
  }

  public startListeningToConnections() {
    this.server.on("connection", (socket, req) => {
      let full_url = `http://127.0.0.1:3333${req.url}`;
      const url = new URL(full_url);
      const gameId = url.searchParams.get("id");
      const playerName = url.searchParams.get("player");

      console.log(`Player connected: ${playerName}`);

      if (!gameId) {
        const socketEvent: SocketEvent<ErrorEvent> = {
          type: Events.error,
          data: {
            message: "Game ID missing",
          },
        };

        socket.send(JSON.stringify(socketEvent));

        return;
      }

      if (!playerName) {
        const socketEvent: SocketEvent<ErrorEvent> = {
          type: Events.error,
          data: {
            message: "Player name missing",
          },
        };

        socket.send(JSON.stringify(socketEvent));

        return;
      }

      const game = this.gameInstances.find(gameId);

      if (!game) {
        console.log("Socket closed");

        const socketEvent: SocketEvent<ErrorEvent> = {
          type: Events.error,
          data: {
            message: "Trying to connect to an game that does not exists",
          },
        };

        socket.send(JSON.stringify(socketEvent));
        socket.terminate();

        return;
      }

      this.listeningToEvents(socket, game, req.url!);
    });
  }

  public listeningToEvents(playerSocket: WebSocket, game: Game, url: string) {
    playerSocket.on("message", (buff) => {
      let data = "";
      data += buff;

      const genericSocketEvent = JSON.parse(data) as GenericSocketEvent;

      switch (genericSocketEvent.type) {
        case Events.join:
          console.log("Event received: Join")
          const socketEvent = JSON.parse(data) as SocketEvent<JoinEvent>;

          const player = new Player({ name: socketEvent.data.playerName, socket: playerSocket });

          game.newPlayer(player);

          const gameState = game.getGameState(socketEvent.data.playerName) 

          const gameStateData = game.getGameStateData(player.name);

          if (!gameStateData) {
            sendErrorEvent(playerSocket, "Error trying to get Game state")

            break;
          }

          const socketEventState: SocketEvent<StateEvent> = {
            type: Events.state,
            data: {
              ...gameStateData
            }
          };

          playerSocket.send(Buffer.from(JSON.stringify(socketEventState)));

          if (gameState.opponent) {
            gameState.opponent.socket?.send(Buffer.from(JSON.stringify(socketEventState)))
          } 

          break;
      }
    });
  }

  public handleSocketUpgrade(
    request: IncomingMessage,
    socket: internal.Duplex,
    head: Buffer,
  ) {
    const wsServer = this.server;
    wsServer.handleUpgrade(request, socket, head, function done(ws) {
      wsServer.emit("connection", ws, request);
    });
  }
}
