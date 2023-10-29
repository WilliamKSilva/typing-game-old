import cors from "cors";
import express, { json } from "express";
import { parse } from "url";
import GameInstances from "./games/instances";
import { newRouter } from "./http/routes";
import WebsocketServer from "./websocket/server";

// The callbacks are "async" code so I think that race conditions can happen
// I want to know how much data this shitty array can hold before starts lagging
// the whole thing
const gameInstances = new GameInstances()

const app = express()
app.use(cors())
app.use(json())
app.use(newRouter(gameInstances))

const httpServer = app.listen("3333", () => {
  console.log("Server listening at port 3333!") 
})

const websocket = new WebsocketServer(gameInstances);

websocket.startListeningToConnections()

httpServer.on("upgrade", (request, socket, head) => {
  const { pathname } = parse(request.url!);

  if (pathname == "/games/connect") {
    websocket.handleSocketUpgrade(request, socket, head);

    return;
  }

  socket.destroy();
  return;
});