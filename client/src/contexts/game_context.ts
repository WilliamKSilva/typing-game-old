import { createContext } from "solid-js";
import { GameData } from "../types/game-data";

const GameContext = createContext([{id: '', player: ''}, (data: GameData) => {}])

export { GameContext };
