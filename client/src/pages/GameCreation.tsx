import { Button, ButtonSize, ButtonType } from "../components/Button";
import { Input } from "../components/Input";
import "./GameCreation.css";

import { FaSolidArrowLeft } from "solid-icons/fa";

export function GameCreation() {
  const onFormSubmit = async (event: any) => {
    event.preventDefault();
    const data = new FormData(event.target);

    const url = `${process.env.VITE_APP_SERVER_URL}/games`;
    const gameData = {
      name: data.get("name"),
      player: data.get("player"),
    };

    const response = await fetch(url, {
      body: JSON.stringify(gameData),
    });
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
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
