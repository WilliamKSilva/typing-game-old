import { WebSocket } from "ws";

type NewPlayer = {
  name: string;
  socket: WebSocket;
};

export default class Player {
  constructor({ name, socket }: NewPlayer) {
    this.name = name;
    this.socket = socket;
    this.buff = "";
    this.ready = false;
  }

  public name: string;
  public buff: string;
  public ready: boolean;
  public socket: WebSocket | null;
}
