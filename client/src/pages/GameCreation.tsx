import axios from "axios";
import { createSignal } from "solid-js";
import { Button, ButtonSize, ButtonType } from "../components/Button";
import { Input } from "../components/Input";
import "./GameCreation.css";

import { FaSolidArrowLeft } from "solid-icons/fa";

type GameData = {
  id: string
  player_one: string
  player_two: string
}

export function GameCreation() {
  const [loading, setLoading] = createSignal(false)

  const [gameData, setGameData] = createSignal<GameData>({
    id: '',
    player_one: '',
    player_two: ''
  })

  const onFormSubmit = async (event: any) => {
    event.preventDefault();
    const data = new FormData(event.target);

    const url = `${import.meta.env.VITE_APP_SERVER_URL}/games/new`;
    const newGameData = {
      name: data.get("name"),
      player: data.get("player"),
    };

    try {
      setLoading(true)
      const response = await axios.post(url, JSON.stringify(newGameData))

      setGameData(response.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  };

  return (
    <div class="wrapper">
      <div class="content-wrapper">
        <div class="content">
          <div class="form-header">
            <FaSolidArrowLeft size={25} color="white" />
            <span class="form-header-title">Create a new game</span>
          </div>
          <form class="form" onSubmit={(event) => onFormSubmit(event)}>
            <div class="form-input-wrapper">
              <Input name="name" placeholder="Game name" />
            </div>
            <div class="form-input-wrapper">
              <Input name="player" placeholder="Your nickname" />
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
}
