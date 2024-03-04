import { PongGame } from "@/app/pong/[id]/PongGame";
import { useCallback, useRef, useState } from "react";
import { useUserMode } from "./useUserMode";
import { PublicUserEntity, UserEntity } from "../dtos";

export default function useGame(currentUser?: UserEntity) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // only initialized once
  const gameRef = useRef<PongGame | null>(null); // only initialized once
  const [userMode, setUserMode] = useUserMode();
  const defaultColor = "hsl(0, 0%, 0%)";

  const [leftPlayer, setLeftPlayer] = useState<PublicUserEntity | undefined>(
    () => (userMode === "player" ? currentUser : undefined),
  );
  const [rightPlayer, setRightPlayer] = useState<PublicUserEntity | undefined>(
    undefined,
  );

  const getPlayerSetterFromPlayerNumber = useCallback(
    (playerNumber: number) => {
      return userMode == "player"
        ? setRightPlayer
        : playerNumber == 1
          ? setLeftPlayer
          : setRightPlayer;
    },
    [userMode],
  );

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
