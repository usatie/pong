import { PongGame } from "@/app/pong/[id]/PongGame";
import { useEffect } from "react";

export default function useGameTheme(
  getGame: () => PongGame,
  resolvedTheme?: string,
) {
  useEffect(() => {
    // TODO: Use --foreground color from CSS
    // Somehow it didn't work (theme is changed but not yet committed to CSS/DOM?)
    const game = getGame();
    const color =
      resolvedTheme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)";
    game.setColor(color);
    game.draw_canvas();
  }, [resolvedTheme, getGame]);
}
