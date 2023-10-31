import { WebSocket } from "ws"
import { SocketEvent } from "./server"
import { ErrorEvent, Events } from "./types"


export const sendErrorEvent = (socket: WebSocket, message: string) => {
  const socketEvent: SocketEvent<ErrorEvent> = {
    type: Events.error,
    data: {
      message
    }
  }

  socket.send(Buffer.from(JSON.stringify(socketEvent)))
}