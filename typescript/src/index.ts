import http from "node:http";
import { parse } from "url";
import { WebSocketServer } from "ws";
import Games from "./games";
import Http from "./http";

const server = http.createServer();
const websocket = new WebSocketServer({
  noServer: true
});

const port = 3333;

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

// The callbacks are "async" code so I think that race conditions can happen
let games = new Games();

websocket.on("connection", (socket) => {
  socket.on("error", console.error);

  socket.on("message", (data) => {
    let buff = ""
    buff += data
    console.log(buff)
  })
});

server.on("upgrade", (request, socket, head) => {
  const { pathname } = parse(request.url!);

  if (pathname == "/games/join") {
  console.log(pathname)
    websocket.handleUpgrade(request, socket, head, function done(ws) {
      websocket.emit("connection", ws, request);
    });

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
