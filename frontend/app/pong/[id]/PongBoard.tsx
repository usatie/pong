"use client";

import { memo, useEffect, useRef } from "react";
import { pongSocket as socket } from "@/socket";
import { PongGame } from "./PongGame";
import { TARGET_FRAME_MS } from "./const";
import { Button } from "@/components/ui/button";

type setFunction = (value: number) => void;

interface PongBoardProps {
  id: string;
  setFps: setFunction;
  setSpeed: setFunction;
  setPlayer1Position: setFunction;
  setPlayer2Position: setFunction;
}
function PongBoard({
  id: id,
  setFps: setFps,
  setSpeed: setSpeed,
  setPlayer1Position: setPlayer1Position,
  setPlayer2Position: setPlayer2Position,
}: PongBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<PongGame>(
    new PongGame(
      socket,
      setFps,
      setSpeed,
      setPlayer1Position,
      setPlayer2Position,
    ),
  );

  useEffect(() => {
    // > If the contextType doesn't match a possible drawing context, or differs from the first contextType requested, null is returned."
    // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.warn("2d canvas is not supported or there is a bug");
      return;
    }
    game.current.setup_canvas(ctx);
    game.current.draw_canvas();
    const intervalId = setInterval(game.current.update, TARGET_FRAME_MS);
    return () => clearInterval(intervalId);
  });
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      game.current.keypress[event.key] = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      game.current.keypress[event.key] = true;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  });

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log(`Connected: ${socket.id}`);
      socket.emit("join", id);
    };

    const handleStart = (data: { vx: number; vy: number }) => {
      console.log(`Start: ${JSON.stringify(data)}`);
      game.current.start(data);
    };

    const handleRight = () => {
      game.current.player2.clear(game.current.ctx);
      game.current.player2.move_left();
      game.current.player2.draw(game.current.ctx);
    };

    const handleLeft = () => {
      game.current.player2.clear(game.current.ctx);
      game.current.player2.move_right();
      game.current.player2.draw(game.current.ctx);
    };

    const handleBounce = () => {
      game.current.ball.bounce_off_paddle(game.current.player2);
    };

    const handleCollide = () => {
      game.current.ball.reset();
      game.current.score.player1++;
    };

    socket.on("connect", handleConnect);
    socket.on("start", handleStart);
    socket.on("right", handleRight);
    socket.on("left", handleLeft);
    socket.on("bounce", handleBounce);
    socket.on("collide", handleCollide);

    return () => {
      socket.disconnect();
      socket.off("connect", handleConnect);
      socket.off("start", handleStart);
      socket.off("right", handleRight);
      socket.off("left", handleLeft);
      socket.off("bounce", handleBounce);
      socket.off("collide", handleCollide);
    };
  }, [id]);

  const start = () => {
    game.current.start();
    socket.emit("start", {
      vx: -game.current.ball.vx,
      vy: -game.current.ball.vy,
    });
  };

  return (
    <>
      <div>
        <Button onClick={start}>Start</Button>
        <Button onClick={game.current.switch_battle_mode}>Battle</Button>
        <Button onClick={game.current.switch_practice_mode}>Practice</Button>
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
