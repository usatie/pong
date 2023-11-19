"use client";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { PongGame } from "./PongGame";
import { TARGET_FRAME_MS } from "./const";

// todo
export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket>(
    io(process.env.NEXT_PUBLIC_WEB_URL as string),
  );
  // todo: check if useRef is necessary. Just const is enough as it doesn't re-render?
  const game = useRef<PongGame>(new PongGame(canvasRef, socketRef.current));

  useEffect(() => {
    game.current.setup_canvas();
    game.current.draw_canvas();
    const intervalId = setInterval(game.current.update, TARGET_FRAME_MS);

    const handleKeyUp = (event: KeyboardEvent) => {
      game.current.keypress[event.key] = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      game.current.keypress[event.key] = true;
    };

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("keyup", handleKeyUp);

    socketRef.current.on("connect", () => {
      console.log(`Connected: ${socketRef.current.id}`);

      socketRef.current.emit("join");
    });

    socketRef.current.on("start", (data) => {
      console.log(`Start: ${JSON.stringify(data)}`);
      game.current.start(data);
    });

    socketRef.current.on("right", () => {
      game.current.player2.clear(game.current.ctx);
      game.current.player2.move_left();
      game.current.player2.draw(game.current.ctx);
    });

    socketRef.current.on("left", () => {
      game.current.player2.clear(game.current.ctx);
      game.current.player2.move_right();
      game.current.player2.draw(game.current.ctx);
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearInterval(intervalId);
    };
  }, []);

  const start = () => {
    game.current.start();
    socketRef.current.emit("start", {
      vx: -game.current.ball.vx,
      vy: -game.current.ball.vy,
    });
  };

  return (
    <>
      {/* <PongInformationBoard {} /> */}
      <div>
        <Button onClick={start}>Start</Button>
        <Button
          onClick={() => {
            game.current.switch_battle_mode();
          }}
        >
          Battle
        </Button>
        <Button
          onClick={() => {
            game.current.switch_practice_mode();
          }}
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
