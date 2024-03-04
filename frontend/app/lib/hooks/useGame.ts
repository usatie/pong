import { PongGame } from "@/app/pong/[id]/PongGame";
import { useCallback, useRef } from "react";
import { UserMode } from "./useUserMode";

export default function useGame(userMode: UserMode) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // only initialized once
  const gameRef = useRef<PongGame | null>(null); // only initialized once
  const defaultColor = "hsl(0, 0%, 0%)";

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
  return { getGame, canvasRef };
}
