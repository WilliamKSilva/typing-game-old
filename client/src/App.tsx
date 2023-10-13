import { useNavigate } from "@solidjs/router";
import { type Component } from "solid-js";
import { Button, ButtonSize, ButtonType } from "./components/Button";

import "./App.css";

const App: Component = () => {
  const navigate = useNavigate();

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
              onClick={() => navigate("/game-join")}
              loading={false}
            />
          </div>
      </main>
    </div>
  );
};

export default App;
