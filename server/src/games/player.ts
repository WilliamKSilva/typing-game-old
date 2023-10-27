import { WebSocket } from "ws";

type NewPlayer = {
  name: string;
};

export default class Player {
  constructor({ name }: NewPlayer) {
    this.name = name;
    this.buff = "";
    this.ready = false;
    this.socket = null;
  }

  public name: string;
  public buff: string;
  public ready: boolean;
  public socket: WebSocket | null;
}
