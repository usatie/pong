import { useEffect, useRef, useState } from "react";
import { useUserMode } from "../useUserMode";
import { UserEntity } from "../../dtos";
import usePlayers from "../usePlayers";
import useGameSocket from "./useGameSocket";
import { TARGET_FRAME_MS } from "@/app/pong/[id]/const";
import useGameKeyboard from "./useGameKeyboard";
import useGameTheme from "./useGameTheme";
import useGetGame from "./useGetGame";

export default function useGame(
  id: string,
  currentUser?: UserEntity,
  resolvedTheme?: string,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // only initialized once
  const [userMode, setUserMode] = useUserMode();
  const { getGame } = useGetGame(canvasRef, userMode);
  const [logs, setLogs] = useState<string[]>([]);
  const [startDisabled, setStartDisabled] = useState(true);

  const { leftPlayer, rightPlayer, getPlayerSetterFromPlayerNumber } =
    usePlayers(userMode, currentUser);

  useGameTheme(getGame, resolvedTheme);
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
