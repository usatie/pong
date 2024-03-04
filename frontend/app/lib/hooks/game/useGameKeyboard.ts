import { PongGame } from "@/app/pong/[id]/PongGame";
import { useEffect } from "react";

export default function useGameKeyboard(getGame: () => PongGame) {
  useEffect(() => {
    const game = getGame();

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key == "ArrowDown" || event.key == "ArrowUp") {
        game.setMovingDirection("none");
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "ArrowDown") {
        game.setMovingDirection("right");
      } else if (event.key == "ArrowUp") {
        game.setMovingDirection("left");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [getGame]);
}
