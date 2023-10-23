import { useParams } from "@solidjs/router";
import {
  Accessor,
  Component,
  Setter,
  Show,
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

type TextSplited = {
  default: string;
  final: string;
};

type InvalidInput = {
  invalid: boolean
  index: number
}

enum TextInputType {
  wrong = "wrong",
  right = "right",
  invalid = "invalid",
}

export const Game: Component<GameProps> = (props) => {
  const params = useParams();
  const [opponentLoading, setOpponentLoading] = createSignal(false);
  const [inputPlayerDisabled, setInputPlayerDisabled] = createSignal(true);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [firstInput, setFirstInput] = createSignal(true);
  const [playerTextState, setPlayerTextState] = createSignal("");
  const [matchText, setMatchText] = createSignal(
    "The sunblock was handed to the girl before practice, but the burned skin was proof she did not apply it. He swore he just saw his sushi move. The opportunity of a lifetime passed before him as he tried to decide between a cone or a cup. Nobody questions who built the pyramids in Mexico. Excitement replaced fear until the final moment.",
  );
  const [textSplited, setTextSplited] = createSignal<TextSplited[]>([]);
  const [invalidInput, setInvalidInput] = createSignal<InvalidInput>({
    index: 0,
    invalid: false
  });

  let websocket: WebSocket | null = null;

  onMount(() => {
    if (props.gameData().opponent.name === "") {
      setOpponentLoading(true);
    }

    const url = `${
      import.meta.env.VITE_APP_WEBSOCKET_SERVER_URL
    }/games/join?id=${params.id}&player=${props.gameData().player.name}`;

    websocket = new WebSocket(url);

    for (let text of matchText()) {
      const newTextSplited: TextSplited[] = [
        ...textSplited(),
        {
          default: text,
          final: "",
        },
      ];
      setTextSplited(newTextSplited);
    }
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

  // const sendWebsocketMessage = (buff: string) => {
  //   if (websocket) {
  //     websocket.send(buff);
  //   }
  // };

  // Each 3 seconds send the player current text state to the server
  // setTimeout(() => {
  //   sendWebsocketMessage(playerBuff());
  // }, 3000);

  const replaceText = (text: string, type: TextInputType) => {
    const textSplitedValue = textSplited();
    textSplitedValue[currentIndex()].final = text;

    setTextSplited(textSplitedValue);

    buildFullText();

    if (type === TextInputType.wrong) {
      const invalid = {
        invalid: true,
        index: currentIndex(),
      };
      setInvalidInput(invalid);
    }
  };

  const buildFullText = () => {
    let fullText: string = "";
    for (let text of textSplited()) {
      if (text.final) {
        fullText = fullText + text.final;
      } else {
        fullText = fullText + text.default;
      }
    }

    setPlayerTextState(fullText);
  };

  const playerInput = (playerText: string, key: string) => {
    if (key === "CapsLock") {
      return;
    }
    if (key === "Backspace") {
      return;
    }
    if (!firstInput()) {
      setCurrentIndex(currentIndex() + 1);
    } else {
      setFirstInput(false);
    }

    const gameTextChar = textSplited()[currentIndex()];
    const playerTextChar = playerText[currentIndex()];

    if (invalidInput().invalid && invalidInput().index === currentIndex()) {
      if (playerTextChar === textSplited()[invalidInput().index].default) {
        const invalid = {
          invalid: false,
          index: 0,
        };
        setInvalidInput(invalid);
      }
    }

    if (invalidInput().invalid) {
      const spanText = `<span class="invalid">${gameTextChar.default}</span>`;
      replaceText(spanText, TextInputType.invalid);

      return;
    }

    if (gameTextChar.default !== playerTextChar) {
      const spanText = `<span class="wrong">${gameTextChar.default}</span>`;
      replaceText(spanText, TextInputType.wrong);

      return;
    }

    const spanText = `<span class="right">${gameTextChar.default}</span>`;
    replaceText(spanText, TextInputType.right);

    return;
  };

  const playerInputDeletion = (currentInput: string, key: string) => {
    if (!firstInput()) {
      if (key === "Backspace") {
        const index = currentInput.length - 1 
        setCurrentIndex(index)
        const textSplitedValue = textSplited();
        textSplitedValue[currentIndex()].final =
          textSplited()[currentIndex()].default;

        setTextSplited(textSplitedValue);

        buildFullText();

        console.log(currentIndex())

        return;
      }
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
              <Input
                placeholder="Start typing..."
                name="player"
                disabled={inputPlayerDisabled()}
                onKeyUp={(evt) => playerInput(evt.target.value, evt.key)}
                onKeyDown={(evt) => playerInputDeletion(evt.target.value, evt.key)}
              />
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
