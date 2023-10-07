import { useParams } from "@solidjs/router";
import { Accessor, Component, Setter, onMount } from "solid-js";
import { Input } from "../components/Input";
import { GameData } from "../types/game_data";
import "./Game.css";

type GameProps = {
  gameData: Accessor<GameData>
  setGameData: Setter<GameData> 
}

export const Game: Component<GameProps> = (props) => {
  const params = useParams()

  onMount(() => {
    const url = `${import.meta.env.VITE_APP_SERVER_URL}/games/join?id=${params.id}&player=${props.gameData().player_one}`;

    const websocket = new WebSocket(url) 
  })

  return (
    <div class="game-wrapper">
      <div class="game-content">
        <strong class="player-name">Player One</strong>
        <div class="player">
          <strong class="game-text">
            sauhduiahduiaidh aiudhi haisdhiahd iahi ahuid aia
          </strong>
          <div class="game-text-input-wrapper">
            <Input placeholder="Start typing..." name="player" />
          </div>
        </div>
      </div>
    </div>
  );
}