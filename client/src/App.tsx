import type { Component } from "solid-js";
import "./App.css";

import { Button, ButtonSize, ButtonType } from "./components/Button";

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
          <Button
            description="New game"
            size={ButtonSize.large}
            type={ButtonType.button}
            primary={true}
            onClick={() => newGame()}
            loading={false}
          />
          <Button
            description="Enter game"
            size={ButtonSize.large}
            type={ButtonType.button}
            primary={false}
            onClick={() => console.log("teste")}
            loading={false}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
