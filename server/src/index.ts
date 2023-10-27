import express from "express";
import Games from "./games";
import GameInstances from "./games/instances";
import { newRouter } from "./http/routes";
import TextGenerator from "./services/random_text";
import Websocket from "./websocket";

const textGenerator = new TextGenerator()

// The callbacks are "async" code so I think that race conditions can happen
// I want to know how much data this shitty array can hold before starts lagging
// the whole thing
let games = new Games(textGenerator);

const gameInstances = new GameInstances()

const httpServer = express()
httpServer.use(newRouter(gameInstances))

httpServer.listen("3000", () => {
  console.log("Server listening at port 3000!") 
})

// const websocket = new WebSocketServer({
//   noServer: true,
// });
const websocket = new Websocket(games);

// server.on("upgrade", (request, socket, head) => {
//   const { pathname } = parse(request.url!);

//   if (pathname == "/games/join") {
//     websocket.handleSocketUpgrade(request, socket, head);

//     return;
//   }

//   socket.destroy();
//   return;
// });