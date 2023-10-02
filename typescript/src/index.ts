import http from "node:http";
import { parse } from "url";
import { WebSocketServer } from "ws";
import Games from "./games";
import Http from "./http";

const server = http.createServer();
const websocket = new WebSocketServer({
  noServer: true,
});

const port = 3333;

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

// The callbacks are "async" code so I think that race conditions can happen
let games = new Games();

websocket.on("connection", (socket, req) => {
  let full_url = `http://127.0.0.1:3333${req.url}`;
  const url = new URL(full_url);
  const game_id = url.searchParams.get("id");
  const player_name = url.searchParams.get("player");
  socket.on("error", console.error);

  if (!game_id) {
    console.log("socket: closed");
    socket.terminate();
    return;
  }

  if (!player_name) {
    console.log("socket: closed");
    socket.terminate();
    return;
  }

  const game = games.find_by_id(game_id);

  if (!game) {
    console.log("socket: closed");
    socket.terminate();
    return;
  }

  socket.on("message", (data) => {
    let buff = "";
    buff += data;

    const [player, opponent] = games.find_player_and_opponent(
      player_name,
      game_id,
    );

    if (!player) {
      socket.terminate();
      return;
    }

    if (!opponent) {
      socket.terminate();
      return;
    }

    player.buff = buff
  });
});

server.on("upgrade", (request, socket, head) => {
  const { pathname } = parse(request.url!);

  if (pathname == "/games/join") {
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
