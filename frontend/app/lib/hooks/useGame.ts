import { PongGame } from "@/app/pong/[id]/PongGame";
import { useCallback, useEffect, useRef } from "react";
import { useUserMode } from "./useUserMode";
import { UserEntity } from "../dtos";
import usePlayers from "./usePlayers";

export default function useGame(
  currentUser?: UserEntity,
  resolvedTheme?: string,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // only initialized once
  const gameRef = useRef<PongGame | null>(null); // only initialized once
  const [userMode, setUserMode] = useUserMode();
  const defaultColor = "hsl(0, 0%, 0%)";

  const { leftPlayer, rightPlayer, getPlayerSetterFromPlayerNumber } =
    usePlayers(userMode, currentUser);

  const getGame = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      throw new Error("canvas not ready");
    }
    if (!gameRef.current) {
      const game = new PongGame(ctx, defaultColor, defaultColor, userMode);
      gameRef.current = game;
      return game;
    }
    return gameRef.current;
  }, [userMode]);

  useEffect(() => {
    // TODO: Use --foreground color from CSS
    // Somehow it didn't work (theme is changed but not yet committed to CSS/DOM?)
    const game = getGame();
    const color =
      resolvedTheme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)";
    game.setColor(color);
    game.draw_canvas();
  }, [resolvedTheme, getGame]);

  return {
    getGame,
    canvasRef,
    userMode,
    setUserMode,
    leftPlayer,
    rightPlayer,
    getPlayerSetterFromPlayerNumber,
  };
}
