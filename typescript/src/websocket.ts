import http from "http";
import { WebSocketServer } from "ws";

export default class Websocket {
  constructor(private http_server: http.Server) {
    this.server = new WebSocketServer({
      server: this.http_server,
    });
  }

  public server: WebSocketServer;
}
