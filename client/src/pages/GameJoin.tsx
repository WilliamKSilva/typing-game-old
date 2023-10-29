import { useNavigate } from "@solidjs/router";
import { FaSolidArrowLeft } from "solid-icons/fa";
import { Component, Setter, createSignal } from "solid-js";
import { Button, ButtonSize, ButtonType } from "../components/Button";
import { Input } from "../components/Input";
import { GameState } from "../types/game-data";

import "./GameJoin.css";

type GameJoinProps = {
  setGameData: Setter<GameState>;
};

export const GameJoin: Component<GameJoinProps> = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);

  const joinExistingGame = async (event: any) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const gameId = data.get("game_id");
    const playerName = data.get("player");

    navigate(`/game/${gameId}?player=${playerName}`);
  };
  return (
    <div class="wrapper">
      <div class="content-wrapper">
        <div class="content">
          <div class="form-header">
            <div class="arrow-left">
              <FaSolidArrowLeft
                size={25}
                color="white"
                onClick={() => navigate("/")}
              />
            </div>
            <span class="form-header-title">Join an existing Game</span>
          </div>
          <form class="form" onSubmit={(event) => joinExistingGame(event)}>
            <div class="form-input-wrapper">
              <Input name="game_id" placeholder="Game ID" disabled={false} />
            </div>
            <div class="form-input-wrapper">
              <Input
                name="player"
                placeholder="Your nickname"
                disabled={false}
              />
            </div>

            <div class="form-input-button-wrapper">
              <Button
                onClick={() => {}}
                description="Salvar"
                size={ButtonSize.medium}
                type={ButtonType.submit}
                primary={true}
                loading={loading()}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
