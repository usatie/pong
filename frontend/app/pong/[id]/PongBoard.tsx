"use client";

import { memo, useEffect, useRef, useState } from "react";
import { PongGame } from "./PongGame";
import { TARGET_FRAME_MS } from "./const";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";

type setFunction<T> = (value: T | ((prevState: T) => T)) => void;

interface PongBoardProps {
  id: string;
  setFps: (value: number | ((prevState: number) => number)) => void;
  setSpeed: setFunction<number>;
  setPlayer1Position: setFunction<number>;
  setPlayer2Position: setFunction<number>;
  setLogs: setFunction<string[]>;
}
function PongBoard({
  id: id,
  setFps: setFps,
  setSpeed: setSpeed,
  setPlayer1Position: setPlayer1Position,
  setPlayer2Position: setPlayer2Position,
  setLogs: setLogs,
}: PongBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket] = useState(() => io("/pong", { query: { game_id: id } }));
  const [game, setGame] = useState<PongGame | undefined>();
  const [startDisabled, setStartDisabled] = useState(true);
  const [practiceDisabled, setPracticeDisabled] = useState(true);
  const [battleDisabled, setBattleDisabled] = useState(true);

  useEffect(() => {
    // > If the contextType doesn't match a possible drawing context, or differs from the first contextType requested, null is returned."
    // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.warn("2d canvas is not supported or there is a bug");
      return;
    }
    setGame(
      new PongGame(
        socket,
        ctx,
        setFps,
        setSpeed,
        setPlayer1Position,
        setPlayer2Position,
      ),
    );
  }, [setFps, setSpeed, setPlayer1Position, setPlayer2Position, socket]);

  useEffect(() => {
    if (!game) return;
    game.draw_canvas();
    const intervalId = setInterval(game.update, TARGET_FRAME_MS);

    return () => clearInterval(intervalId);
  }, [game]);
  useEffect(() => {
    if (!game) return;

    const handleKeyUp = (event: KeyboardEvent) => {
      game.keypress[event.key] = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      game.keypress[event.key] = true;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [game]);

  useEffect(() => {
    if (!game) return;

    const handleLog = (log: string) => {
      setLogs((logs) => [...logs, log]);
    };
    const handleConnect = () => {
      console.log(`Connected: ${socket.id}`);
      const log = "Connected to server";
      setLogs((logs) => [...logs, log]);
    };

    const handleStart = (data: { vx: number; vy: number }) => {
      console.log(`Start: ${JSON.stringify(data)}`);
      game.start(data);
      setStartDisabled(true);
    };

    const handleRight = () => {
      game.player2.clear(game.ctx);
      game.player2.move_left();
      game.player2.draw(game.ctx);
    };

    const handleLeft = () => {
      game.player2.clear(game.ctx);
      game.player2.move_right();
      game.player2.draw(game.ctx);
    };

    const handleBounce = () => {
      game.ball.bounce_off_paddle(game.player2);
    };

    const handleCollide = () => {
      game.ball.reset();
      game.score.player1++;
      setStartDisabled(false);
    };

    const handleJoin = () => {
      const log = `Your friend has joined to the game`;
      setLogs((logs) => [...logs, log]);
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

    socket.on("connect", handleConnect);
    socket.on("start", handleStart);
    socket.on("right", handleRight);
    socket.on("left", handleLeft);
    socket.on("bounce", handleBounce);
    socket.on("collide", handleCollide);
    socket.on("join", handleJoin);
    socket.on("leave", handleLeave);
    socket.on("log", handleLog);

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
    };
  }, [id, setLogs, socket, game]);

  const start = () => {
    if (!game) return;

    setStartDisabled(true);
    game.start();
    socket.emit("start", {
      vx: -game.ball.vx,
      vy: -game.ball.vy,
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={start} disabled={startDisabled}>
          Start
        </Button>
        <Button onClick={game?.switch_battle_mode} disabled={battleDisabled}>
          Battle
        </Button>
        <Button
          onClick={game?.switch_practice_mode}
          disabled={practiceDisabled}
        >
          Practice
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width="256"
        height="512"
        className="border w-[256px] h-[512px]"
      ></canvas>
    </>
  );
}

const memoizedPongBoard = memo(PongBoard);
export default memoizedPongBoard;
// export default PongBoard;
