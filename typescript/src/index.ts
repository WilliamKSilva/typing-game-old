import http from "node:http";
import Games from "./games";
import Http from "./http";
import Websocket from "./websocket";

const server = http.createServer();
const websocket = new Websocket(server);

const port = 3333;

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

// The callbacks are "async" code so I think that race conditions can happen
let games = new Games();

websocket.server.on("connection", (socket) => {
  console.log("Socket connected!");
});

server.on("error", (err) => {
  console.log(err);
});

server.on("request", (req, res) => {
  const http = new Http(req, res, games);
  try {
    http.redirect((response_data) => {
      let response: string = ''

      if (!response_data) {
        const json = {
          message: "ok",
          status: 200,
        };

        response = http.response(json);
      } else {
        response = http.response(response_data);
      }

      http.write_and_close(response, 200);
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
