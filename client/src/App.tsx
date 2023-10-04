import type { Component } from "solid-js";
import "./App.css";

import { Button } from "./components/Button";

const App: Component = () => {
  const newGame = async () => {
    const url = `${process.env.VITE_APP_SERVER_URL}/games`;
    const gameData = {
      name: "",
      player: "",
    };
    const response = await fetch(url, {
      body: JSON.stringify(gameData),
    });
  };

  return (
    <div class="wrapper">
      <main>
        <div class="main-content">
          <Button description="New game" primary={true} onClick={() => newGame()} />
          <Button description="Enter game" primary={false} onClick={() => console.log("teste")}/>
        </div>
      </main>
    </div>
  );
};

export default App;
