import { useParams, useSearchParams } from "@solidjs/router";
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
import { GameState, GameStatus } from "../types/game-data";
import {
  Events,
  GenericSocketEvent,
  JoinEvent,
  SocketEvent,
  StateEvent,
} from "../types/websocket";
import { readBlob } from "../utils/readBlob";
import "./Game.css";

type GameProps = {
  gameData: Accessor<GameState>;
  setGameData: Setter<GameState>;
};

type TextSplited = {
  default: string;
  final: string;
};

type InvalidInput = {
  invalid: boolean;
  index: number;
};

enum TextInputType {
  wrong = "wrong",
  right = "right",
  invalid = "invalid",
}

type StartGameState = {
  started: boolean;
  startMessage: boolean;
  countDownFinished: boolean;
};

// TODO: find a way of optimize/reduce all this signals
export const Game: Component<GameProps> = (props) => {
  const params = useParams();
  const [searchParams] = useSearchParams();

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
    invalid: false,
  });
  const [renderPlayerCondition, setRenderPlayerCondition] = createSignal(false);
  const [startGame, setStartGame] = createSignal<StartGameState>({
    started: false,
    startMessage: false,
    countDownFinished: false,
  });
  const [gameStarted, setGameStarted] = createSignal(true);
  const [timer, setTimer] = createSignal(10);

  let websocket: WebSocket | null = null;

  onMount(() => {
    const gameId = params.id;
    const playerName = searchParams.player;

    const url = `${
      import.meta.env.VITE_APP_WEBSOCKET_SERVER_URL
    }/games/connect?id=${gameId}&player=${searchParams.player}`;

    websocket = new WebSocket(url);

    const joinEvent: SocketEvent<JoinEvent> = {
      type: Events.join,
      data: {
        playerName,
      },
    };

    if (!websocket) {
      return;
    }

    websocket.addEventListener("open", () => {
      websocket?.send(JSON.stringify(joinEvent));
    });

    buildMatchText();
  });

  createEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        readBlob(event.data, (result) => {
          if (result) {
            const data = JSON.parse(result as string) as GenericSocketEvent;

            switch (data.type) {
              case Events.state:
                const joinEvent = JSON.parse(
                  result as string,
                ) as SocketEvent<StateEvent>;

                props.setGameData(joinEvent.data);

                if (!props.gameData().opponent) {
                  setOpponentLoading(true)
                }

                break;
            }

            // if (data.type === "ready") {
            //   const startGameState: StartGameState = {
            //     started: true,
            //     startMessage: false,
            //     countDownFinished: false,
            //   };

            //   setStartGame(startGameState);
            //   setRenderPlayerCondition(false);

            //   return;
            // }

            // if (data.opponent.name) {
            //   setOpponentLoading(false);
            //   props.setGameData(data);
            // }

            // if (data.match_text) {
            //   setPlayerTextState(props.gameData().match_text);
            // }

            // if (data.player.name && data.opponent.name) {
            //   setRenderPlayerCondition(true);
            // }
          }
        });
      };
    }
  });

  const sendPlayerReadyEvent = (ready: boolean) => {
    if (websocket) {
      const eventData = {
        type: "ready",
        data: {
          ready,
        },
      };
      websocket.send(JSON.stringify(eventData));
    }
  };

  // Each 3 seconds send the player current text state to the server
  // setTimeout(() => {
  //   sendWebsocketMessage(playerBuff());
  // }, 3000);

  const buildMatchText = () => {
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
  };

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
        const index = currentInput.length - 1;
        setCurrentIndex(index);
        const textSplitedValue = textSplited();
        textSplitedValue[currentIndex()].final =
          textSplited()[currentIndex()].default;

        setTextSplited(textSplitedValue);

        buildFullText();

        setCurrentIndex(index - 1);

        return;
      }
    }
  };

  createEffect(() => {
    if (timer() === 0) {
      const startGameState: StartGameState = {
        started: true,
        startMessage: true,
        countDownFinished: true,
      };

      setStartGame(startGameState);

      setInputPlayerDisabled(false);

      setTimeout(() => {
        const startGameState: StartGameState = {
          started: true,
          startMessage: false,
          countDownFinished: true,
        };

        setStartGame(startGameState);
      }, 3000);

      return;
    }

    if (startGame().started && timer() > 0) {
      setTimeout(() => {
        setTimer(timer() - 1);
      }, 1000);
    }
  }, 1);

  const renderCounter = () => {
    if (startGame().countDownFinished && startGame().startMessage) {
      return <strong>Go!</strong>;
    }

    if (startGame().countDownFinished && !startGame().startMessage) {
      return;
    }

    return <strong>{timer()}</strong>;
  };

  return (
    <div class="game-wrapper">
      <div class="game-content">
        <div class="players-area">
          <Show when={startGame().started}>
            <div class="game-timer">{renderCounter()}</div>
          </Show>
          <div class="wrapper-players">
            <div class="player">
              <Show when={renderPlayerCondition()}>
                {props.gameData().player?.ready &&
                props.gameData().status !== GameStatus.started ? (
                  <div class="player-ready">
                    <strong class="player-ready-text">Ready</strong>
                    <button onClick={() => sendPlayerReadyEvent(false)}>
                      Not ready
                    </button>
                  </div>
                ) : (
                  <div class="player-ready">
                    <strong class="player-not-ready-text">Not ready</strong>
                    <button onClick={() => sendPlayerReadyEvent(true)}>
                      Ready
                    </button>
                  </div>
                )}
              </Show>
              <strong class="player-name">
                {props.gameData().player?.name}
              </strong>
              <div class="game-text" innerHTML={playerTextState()}></div>
              <div class="game-text-input-wrapper">
                <Input
                  placeholder="Start typing..."
                  name="player"
                  disabled={inputPlayerDisabled()}
                  onKeyUp={(evt) => playerInput(evt.target.value, evt.key)}
                  onKeyDown={(evt) =>
                    playerInputDeletion(evt.target.value, evt.key)
                  }
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
                <Show when={renderPlayerCondition()}>
                  {props.gameData().opponent?.ready &&
                  props.gameData().status !== GameStatus.started ? (
                    <div class="player-ready">
                      <strong class="player-ready-text">Ready</strong>
                    </div>
                  ) : (
                    <div class="player-ready">
                      <strong class="player-not-ready-text">Not ready</strong>
                    </div>
                  )}
                </Show>
                <strong class="player-name">
                  {props.gameData().opponent?.name}
                </strong>
                <strong class="game-text">{props.gameData().matchText}</strong>
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
    </div>
  );
};
