"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { PongGame } from "./PongGame";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TARGET_FRAME_MS } from "./const";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import PongInformationBoard from "./PongInformationBoard";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";

type setState<T> = T | ((prevState: T) => T);

function useStateCallback<T>(
  initialState: T | (() => T),
): [T, (arg: setState<T>) => void] {
  const [state, setState] = useState<T>(initialState);
  const memoizedSetFunction = useCallback(
    (arg: setState<T>) => setState(arg),
    [],
  );

  return [state, memoizedSetFunction];
}

interface PongBoardProps {
  id: string;
}

interface HandleActionProps {
  playerNumber: number;
}

const POINT_TO_WIN = 3;

function PongBoard({ id: id }: PongBoardProps) {
  const [fps, setFps] = useStateCallback<number>(0);
  const [speed, setSpeed] = useStateCallback<number>(0);
  const [player1Position, setPlayer1Position] = useStateCallback<number>(0);
  const [player2Position, setPlayer2Position] = useStateCallback<number>(0);
  const [logs, setLogs] = useStateCallback<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null); // only initialized once
  const gameRef = useRef<PongGame | null>(null); // only initialized once
  const socketRef = useRef<Socket | null>(null); // updated on `id` change
  const [startDisabled, setStartDisabled] = useState(true);
  const [practiceDisabled, setPracticeDisabled] = useState(true);
  const [battleDisabled] = useState(true);
  const { resolvedTheme } = useTheme();
  const paddleColor = useRef("hsl(0, 0%, 0%)");
  const ballColor = useRef("hsl(0, 0%, 0%)");
  const searchParams = useSearchParams();
  const isPlayer = searchParams.get("mode") == "player";

  const getGame = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      throw new Error("canvas not ready");
    }
    if (!gameRef.current) {
      const game = new PongGame(
        socketRef,
        ctx,
        setFps,
        setSpeed,
        setPlayer1Position,
        setPlayer2Position,
        paddleColor,
        ballColor,
        isPlayer,
      );
      gameRef.current = game;
      return game;
    }
    return gameRef.current;
  }, [setFps, setSpeed, setPlayer1Position, setPlayer2Position, isPlayer]);

  const start = useCallback(() => {
    if (!isPlayer) return;
    const game = getGame();

    setStartDisabled(true);

    const { vx, vy } = game.start({ vx: undefined, vy: undefined });
    socketRef.current?.emit("start", {
      vx: -vx,
      vy: -vy,
    });
  }, [getGame, isPlayer]);

  useEffect(() => {
    // TODO: Use --foreground color from CSS
    // Somehow it didn't work (theme is changed but not yet committed to CSS/DOM?)
    if (resolvedTheme === "dark") {
      paddleColor.current = "hsl(0, 0%, 100%)";
      ballColor.current = "hsl(0, 0%, 100%)";
    } else {
      paddleColor.current = "hsl(0, 0%, 0%)";
      ballColor.current = "hsl(0, 0%, 0%)";
    }
    const game = getGame();
    game.draw_canvas();
  }, [resolvedTheme, getGame]);

  useEffect(() => {
    const game = getGame();
    game.draw_canvas();
    const intervalId = setInterval(game.update, TARGET_FRAME_MS);

    return () => clearInterval(intervalId);
  }, [getGame]);

  useEffect(() => {
    const game = getGame();

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key == "ArrowRight" || event.key == "ArrowLeft") {
        game.setMovingDirection("none");
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "ArrowRight") {
        game.setMovingDirection("right");
      } else if (event.key == "ArrowLeft") {
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

  useEffect(() => {
    const socket = io("/pong", { query: { game_id: id, is_player: isPlayer } });
    socketRef.current = socket;
    const game = getGame();

    const handleLog = (log: string) => {
      setLogs((logs) => [...logs, log]);
    };
    const handleConnect = () => {
      console.log(`Connected: ${socketRef.current?.id}`);
      const log = "Connected to server";
      setLogs((logs) => [...logs, log]);
    };

    const handleStart = (data: { vx: number; vy: number }) => {
      console.log(`Start: ${JSON.stringify(data)}`);
      game.start(data);
      setStartDisabled(true);
    };

    const handleRight = ({ playerNumber }: HandleActionProps) => {
      if (!isPlayer && playerNumber == 1) {
        game.movePlayer1Left();
      } else {
        game.movePlayer2Left();
      }
    };

    const handleLeft = ({ playerNumber }: HandleActionProps) => {
      if (!isPlayer && playerNumber == 1) {
        game.movePlayer1Right();
      } else {
        game.movePlayer2Right();
      }
    };

    const handleBounce = ({ playerNumber }: HandleActionProps) => {
      if (!isPlayer && playerNumber == 1) {
        game.bounceOffPaddlePlayer1();
      } else {
        game.bounceOffPaddlePlayer2();
      }
    };

    const handleCollide = (msg: HandleActionProps) => {
      const { playerNumber } = msg;
      console.log(msg);
      if (isPlayer) {
        console.log("isPlayer");
        game.score.player1++;
        if (game.score.player1 != POINT_TO_WIN) {
          setTimeout(() => start(), 1000);
        }
      } else {
        console.log(playerNumber);
        if (playerNumber == 1) {
          console.log("player1");
          game.score.player2++;
        } else {
          console.log("player2");
          game.score.player1++;
        }
      }
      game.endRound();
    };

    const handleJoin = () => {
      const log = `Your friend has joined the game`;
      setLogs((logs) => [...logs, log]);
      // TODO : does not able for viewer
      setStartDisabled(false);
      setPracticeDisabled(true);
      game.resetPlayerPosition();
    };

    const handleLeave = () => {
      const log = `Your friend has left`;
      setLogs((logs) => [...logs, log]);
      setStartDisabled(true);
      setPracticeDisabled(false);
    };

    const handleFinish = () => {
      const game = getGame();
      game.stop();
    };

    socket.on("connect", handleConnect);
    socket.on("start", handleStart);
    socket.on("right", handleRight);
    socket.on("left", handleLeft);
    socket.on("bounce", handleBounce);
    socket.on("collide", handleCollide);
    socket.on("join", handleJoin);
    socket.on("leave", handleLeave);
    socket.on("log", handleLog);
    socket.on("finish", handleFinish);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("start", handleStart);
      socket.off("right", handleRight);
      socket.off("left", handleLeft);
      socket.off("bounce", handleBounce);
      socket.off("collide", handleCollide);
      socket.off("join", handleJoin);
      socket.off("leave", handleLeave);
      socket.off("log", handleLog);
      socket.off("finish", handleFinish);
      socket.disconnect();
    };
  }, [id, getGame, setLogs, start, isPlayer]);

  return (
    <div className="overflow-hidden flex-grow flex gap-8 pb-8">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border flex-grow"></canvas>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={start} disabled={startDisabled}>
            Start
          </Button>
          <Button
            onClick={() => gameRef.current?.switch_battle_mode()}
            disabled={battleDisabled}>
            Battle
          </Button>
          <Button
            onClick={() => gameRef.current?.switch_practice_mode()}
            disabled={practiceDisabled}>
            Practice
          </Button>
        </div>
        <PongInformationBoard
          fps={fps}
          speed={speed}
          player1Position={player1Position}
          player2Position={player2Position}
          logs={logs}
          isPlayer={isPlayer}
        />
      </div>
    </div>
  );
}

const memoizedPongBoard = memo(PongBoard);
export default memoizedPongBoard;
// export default PongBoard;
