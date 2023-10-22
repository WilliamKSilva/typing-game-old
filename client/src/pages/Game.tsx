import { useParams } from "@solidjs/router";
import {
  Accessor,
  Component,
  Setter,
  Show,
  createEffect,
  createSignal,
  onMount
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
  const [playerBuff, setPlayerBuff] = createSignal("");
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [firstInput, setFirstInput] = createSignal(true);
  const [opponentBuff, setOpponentBuff] = createSignal("");
  const [playerTextState, setPlayerTextState] = createSignal("");

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
            const data = JSON.parse(result as string);

            if (data.opponent.name) {
              setOpponentLoading(false);
              props.setGameData(data);
              setInputPlayerDisabled(false);
            }

            if (data.match_text) {
              setPlayerTextState(props.gameData().match_text);
            }
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

  // Each 3 seconds send the player current text state to the server
  // setTimeout(() => {
  //   sendWebsocketMessage(playerBuff());
  // }, 3000);

  const replaceChar = (text: string, index: number, replaceContent: string) => {
    return (
      text.substring(0, index) +
      replaceContent +
      text.substring(index + replaceContent.length)
    );
  };

  const playerInput = (playerText: string) => {
    console.log("playerState", playerText)
    if (!firstInput()) {
      setCurrentIndex(currentIndex() + 1);
    } else {
      setFirstInput(false)
    }

    const gameTextChar = props.gameData().match_text[currentIndex()];
    const playerTextChar = playerText[currentIndex()]


    console.log("gameText", gameTextChar)
    console.log("playerText", playerTextChar)

    if (
      gameTextChar !== playerTextChar 
    ) {
      let newPlayerStateText = playerTextState();

      const updatedPlayerStateText = replaceChar(
        newPlayerStateText,
        currentIndex(),
        `<span class="wrong">${playerTextChar}</span>`,
      );

      setPlayerTextState(updatedPlayerStateText)
    }
  };

  return (
    <div class="game-wrapper">
      <div class="game-content">
        <div class="players-area">
          <div class="player">
            <strong class="player-name">{props.gameData().player.name}</strong>
            <div class="game-text" innerHTML={playerTextState()}></div>
            <div class="game-text-input-wrapper">
              <input onKeyUp={(evt) => playerInput(evt.target.value)} /> 
            </div>
          </div>
          <Show when={opponentLoading()}>
            <div class="loading-player">
              <p class="loading-player-text">Waiting player connect...</p>
              <Loading />
            </div>
          </Show>
          <Show when={opponentLoading() === false}>
            <div class="player">
              <strong class="player-name">
                {props.gameData().opponent.name}
              </strong>
              <strong class="game-text">{props.gameData().match_text}</strong>
              <div class="game-text-input-wrapper">
                <Input
                  placeholder="Start typing..."
                  name="player"
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
