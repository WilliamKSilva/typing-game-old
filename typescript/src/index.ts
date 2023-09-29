import http from "node:http";
import Games from "./games";
import HttpRouter from "./http";

const server = http.createServer();

const port = 3333;

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

// Don't know if this is thread safe or will need an mutex or some shit like that!
let games = new Games();

server.on("request", (req, res) => {
  const router = new HttpRouter(req, res, games);
  try {
    router.redirect();

    router.write_and_close();
  } catch (error) {
    console.log(error);
    router.write_and_close();
  }
});
