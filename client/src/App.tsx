import { Setter, Show, createSignal, type Component } from "solid-js";
import "./App.css";

import { useNavigate } from "@solidjs/router";
import axios from "axios";
import { Button, ButtonSize, ButtonType } from "./components/Button";
import { Input } from "./components/Input";
import { GameData } from "./types/game_data";

type HomeProps = {
  setGameData: Setter<GameData>;
};

const App: Component<HomeProps> = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [joinGame, setJoinGame] = createSignal(false);

  const joinExistingGame = async (event: any) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const game_id = data.get("game_id");
    const nickname = data.get("player");

    const url = `${import.meta.env.VITE_APP_HTTP_SERVER_URL}/games/update`;

    try {
      setLoading(true);
      const response = await axios.post(
        url,
        JSON.stringify({
          game_id,
          player: nickname
        }),
      );

      const responseData = response.data as GameData;

      console.log(responseData)
      setLoading(false);

      if (responseData.id) {
        responseData.player.name = nickname as string;

        props.setGameData(responseData);
        navigate(`/game/${responseData.id}`);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div class="wrapper">
      <main>
        <Show when={!joinGame()}>
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
              onClick={() => setJoinGame(true)}
              loading={false}
            />
          </div>
        </Show>
        <Show when={joinGame()}>
          <div class="join-game">
            <form class="form" onSubmit={(event) => joinExistingGame(event)}>
              <Input name="player" placeholder="Your nickname..." onChange={() => {}} />
              <Input name="game_id" placeholder="The ID of the game..." onChange={() => {}} />
              <Button
                description="Join game"
                size={ButtonSize.large}
                type={ButtonType.submit}
                primary={true}
                onClick={() => {}}
                loading={loading()}
              />
            </form>
          </div>
        </Show>
      </main>
    </div>
  );
};

export default App;
