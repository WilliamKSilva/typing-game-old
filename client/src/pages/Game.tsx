import { useParams } from "@solidjs/router";
import { Accessor, Component, Setter, onMount } from "solid-js";
import { Input } from "../components/Input";
import { GameData } from "../types/game_data";
import { readBlob } from "../utils/readBlob";
import "./Game.css";

type GameProps = {
  gameData: Accessor<GameData>
  setGameData: Setter<GameData> 
}

export const Game: Component<GameProps> = (props) => {
  const params = useParams()

  onMount(() => {
    console.log("state", props.gameData())
    console.log("game_id", params.id)

    const url = `${import.meta.env.VITE_APP_WEBSOCKET_SERVER_URL}/games/join?id=${params.id}&player=${props.gameData().player.name}`;

    console.log(url)

    const websocket = new WebSocket(url) 
    websocket.onmessage = (event) => {
      readBlob(event.data, (result) => {
        if (result) {
          const data = JSON.parse(result as string) as GameData

          console.log(data)
        }
      })
    }
  })

  return (
    <div class="game-wrapper">
      <div class="game-content">
        <strong class="player-name"></strong>
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