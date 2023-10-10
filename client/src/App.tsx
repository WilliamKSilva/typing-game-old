import type { Component } from "solid-js";
import "./App.css";

import { useNavigate } from "@solidjs/router";
import { Button, ButtonSize, ButtonType } from "./components/Button";

const App: Component = () => {
  const navigate = useNavigate() 

  return (
    <div class="wrapper">
      <main>
        <div class="main-content">
          <Button
            description="New game"
            size={ButtonSize.large}
            type={ButtonType.button}
            primary={true}
            onClick={() => navigate("/game")}
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
