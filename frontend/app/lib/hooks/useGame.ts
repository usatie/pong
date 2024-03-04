import { PongGame } from "@/app/pong/[id]/PongGame";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserMode } from "./useUserMode";
import { UserEntity } from "../dtos";
import usePlayers from "./usePlayers";
import useGameSocket from "./useGameSocket";
import { TARGET_FRAME_MS } from "@/app/pong/[id]/const";
import useGameKeyboard from "./useGameKeyboard";

export default function useGame(
  id: string,
  currentUser?: UserEntity,
  resolvedTheme?: string,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // only initialized once
  const gameRef = useRef<PongGame | null>(null); // only initialized once
  const [userMode, setUserMode] = useUserMode();
  const defaultColor = "hsl(0, 0%, 0%)";
  const [logs, setLogs] = useState<string[]>([]);
  const [startDisabled, setStartDisabled] = useState(true);

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

  useGameKeyboard(getGame);

  const { start } = useGameSocket(
    id,
    getGame,
    setLogs,
    userMode,
    setUserMode,
    getPlayerSetterFromPlayerNumber,
    setStartDisabled,
    currentUser,
  );

  useEffect(() => {
    // TODO: Use --foreground color from CSS
    // Somehow it didn't work (theme is changed but not yet committed to CSS/DOM?)
    const game = getGame();
    const color =
      resolvedTheme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)";
    game.setColor(color);
    game.draw_canvas();
  }, [resolvedTheme, getGame]);

  useEffect(() => {
    const game = getGame();
    game.draw_canvas();
    const intervalId = setInterval(game.update, TARGET_FRAME_MS);

    return () => clearInterval(intervalId);
  }, [getGame]);

  return {
    getGame,
    canvasRef,
    userMode,
    leftPlayer,
    rightPlayer,
    logs,
    start,
    startDisabled,
  };
}
