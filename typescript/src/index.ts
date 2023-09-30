import http from "node:http";
import Games from "./games";
import Http from "./http";

const server = http.createServer();

const port = 3333;

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

// Don't know if this is thread safe or will need an mutex or some shit like that!
// The callbacks are "async" code so I think that shit can happen 
let games = new Games();

server.on("request", (req, res) => {
  const http = new Http(req, res, games);
  try {
    http.redirect();

    const json = {
      message: "ok",
      status: 200 
    }

    const response = http.response(json)

    http.write_and_close(response, 200);
  } catch (error: any) {
    const json = {
      message: error.message,
      status: error.status_code
    }

    const response = http.response(json)

    http.write_and_close(response, error.status_code);
  }
});
