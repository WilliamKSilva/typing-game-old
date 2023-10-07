import { createContext } from "solid-js";
import { GameData } from "../types/game_data";

const GameContext = createContext([{id: '', player: ''}, (data: GameData) => {}])

export { GameContext };
