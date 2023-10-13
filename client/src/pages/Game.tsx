import { useParams } from "@solidjs/router";
import {
  Accessor,
  Component,
  Match,
  Setter,
  Switch,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { GameData } from "../types/game_data";
import { readBlob } from "../utils/readBlob";
import "./Game.css";

type GameProps = {
  gameData: Accessor<GameData>;
  setGameData: Setter<GameData>;
};

export const Game: Component<GameProps> = (props) => {
  const params = useParams();
  const [opponentLoading, setOpponentLoading] = createSignal(false);
  const [inputPlayerDisabled, setInputPlayerDisabled] = createSignal(true);

  let websocket: WebSocket | null = null;

  onMount(() => {
    if (props.gameData().opponent.name === "") {
      setOpponentLoading(true);
    }

    const url = `${
      import.meta.env.VITE_APP_WEBSOCKET_SERVER_URL
    }/games/join?id=${params.id}&player=${props.gameData().player.name}`;

    websocket = new WebSocket(url);
  });

  createEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        readBlob(event.data, (result) => {
          if (result) {
            const data = JSON.parse(result as string) as GameData;

            if (data.opponent.name) {
              setOpponentLoading(false);
            }

            console.log(data);
          }
        });
      };
    }
  });

  const sendWebsocketMessage = (buff: string) => {
    if (websocket) {
      websocket.send(buff);
    }
  };

  return (
    <div class="game-wrapper">
      <div class="game-content">
        <div class="players-area">
          <div class="player">
            <strong class="player-name">William</strong>
            <strong class="game-text">
              sauhduiahduiaidh aiudhi haisdhiahd iahi ahuid aia
            </strong>
            <div class="game-text-input-wrapper">
              <Input
                placeholder="Start typing..."
                name="player"
                onChange={(event) => sendWebsocketMessage(event.target.value)}
                disabled={inputPlayerDisabled()}
              />
            </div>
          </div>
          <Switch>
            <Match when={opponentLoading()}>
              <div class="loading-player">
                <p class="loading-player-text">Waiting player connect...</p>
                <Loading />
              </div>
            </Match>
            <Match when={!opponentLoading()}>
              <div class="player">
                <strong class="player-name">William</strong>
                <strong class="game-text">
                  sauhduiahduiaidh aiudhi haisdhiahd iahi ahuid aia
                </strong>
                <div class="game-text-input-wrapper">
                  <Input
                    placeholder="Start typing..."
                    name="player"
                    onChange={(event) =>
                      sendWebsocketMessage(event.target.value)
                    }
                    disabled={true}
                  />
                </div>
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};
