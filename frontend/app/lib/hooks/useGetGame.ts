import { PongGame } from "@/app/pong/[id]/PongGame";
import { MutableRefObject, useCallback, useRef } from "react";
import { UserMode } from "./useUserMode";
import { DEFAULT_COLOR } from "@/app/pong/[id]/const";

export default function useGetGame(
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  userMode: UserMode,
) {
  const gameRef = useRef<PongGame | null>(null); // only initialized once

  const getGame = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      throw new Error("canvas not ready");
    }
    if (!gameRef.current) {
      const game = new PongGame(ctx, DEFAULT_COLOR, DEFAULT_COLOR, userMode);
      gameRef.current = game;
      return game;
    }
    return gameRef.current;
  }, [canvasRef, userMode]);

  return { getGame };
}
