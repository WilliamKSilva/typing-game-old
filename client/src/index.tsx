/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router, Routes } from "@solidjs/router";
import { createSignal } from "solid-js";
import App from "./App";
import { GameContext } from "./contexts/game_context";
import "./index.css";
import { Game } from "./pages/Game";
import { GameCreation } from "./pages/GameCreation";
import { GameJoin } from "./pages/GameJoin";
import { Teste } from "./pages/Teste";
import { GameState, GameStatus } from "./types/game-data";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

const [gameData, setGameData] = createSignal<GameState>({
  id: '',
  status: GameStatus.awaiting,
  matchText: '',
  player: {
    name: '',
    buff: '',
    ready: false,
  },
  opponent: {
    name: '',
    buff: '',
    ready: false,
  }
})

render(
  () => (
    <Router>
      <GameContext.Provider value={[gameData, setGameData]}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/game" element={<GameCreation setGameData={setGameData} />} />
          <Route path="/game-join" element={<GameJoin setGameData={setGameData} />} />
          <Route path="/game/:id" element={<Game gameData={gameData} setGameData={setGameData} />} />
          <Route path="/teste" element={<Teste />} />
        </Routes>
      </GameContext.Provider>
    </Router>
  ),
  root!,
);
