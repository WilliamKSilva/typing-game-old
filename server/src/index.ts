import cors from "cors";
import express, { json } from "express";
import GameInstances from "./games/instances";
import { newRouter } from "./http/routes";

// The callbacks are "async" code so I think that race conditions can happen
// I want to know how much data this shitty array can hold before starts lagging
// the whole thing
const gameInstances = new GameInstances()

const httpServer = express()
httpServer.use(cors())
httpServer.use(json())
httpServer.use(newRouter(gameInstances))

httpServer.listen("3333", () => {
  console.log("Server listening at port 3333!") 
})

// const websocket = new WebSocketServer({
//   noServer: true,
// });
// const websocket = new Websocket(games);

// server.on("upgrade", (request, socket, head) => {
//   const { pathname } = parse(request.url!);

//   if (pathname == "/games/join") {
//     websocket.handleSocketUpgrade(request, socket, head);

//     return;
//   }

//   socket.destroy();
//   return;
// });