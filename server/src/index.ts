import http from "node:http";
import { parse } from "url";
import Games from "./games";
import Http from "./http";
import Websocket from "./websocket";

// The callbacks are "async" code so I think that race conditions can happen
// I want to know how much data this shitty array can hold before starts lagging
// the whole thing
let games = new Games();

const server = http.createServer();
// const websocket = new WebSocketServer({
//   noServer: true,
// });
const websocket = new Websocket(games)

const port = 3333;

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

server.on("upgrade", (request, socket, head) => {
  const { pathname } = parse(request.url!);

  if (pathname == "/games/join") {
    websocket.handleSocketUpgrade(request, socket, head)

    return;
  }

  socket.destroy();
  return;
});

server.on("error", (err) => {
  console.log(err);
});

server.on("request", (req, res) => {
  const http = new Http(req, res, games);
  try {
    http.redirect((response_data) => {
      if (!response_data) {
        const json = {
          message: "ok",
          status: 200,
        };

        const response = http.response(json);
        http.write_and_close(response, 200);
      } else {
        const response = http.response(response_data);

        http.write_and_close(response, 200);
      }
    });
  } catch (error: any) {
    const json = {
      message: error.message,
      status: error.status_code,
    };

    const response = http.response(json);

    http.write_and_close(response, error.status_code);
  }
});