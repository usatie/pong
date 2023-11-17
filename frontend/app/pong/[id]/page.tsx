"use client";
import { Button } from "@/components/ui/button";
import io from "Socket.IO-client";
import { useEffect, useState } from "react";
import { PongGame } from "./PongGame";
import { TARGET_FRAME_MS } from "./const";

const socket = io("https://pong.shunusami.com/");

export default function Page() {
  let game: PongGame;
  const [fps, setFps] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [player1Position, setPlayer1Position] = useState(0);
  const [player2Position, setPlayer2Position] = useState(0);

  socket.on("connect", () => {
    console.log(`Connected: ${socket.id}`);

    socket.emit("join");
  });

  socket.on("start", (data) => {
    console.log(`Start: ${JSON.stringify(data)}`);
    game.start(data);
  });

  socket.on("right", () => {
    game.player2.clear(game.ctx);
    game.player2.move_left();
    game.player2.draw(game.ctx);
  });

  socket.on("left", () => {
    game.player2.clear(game.ctx);
    game.player2.move_right();
    game.player2.draw(game.ctx);
  });

  // Key Events
  useEffect(() => {
    const handleKeyUp = (event) => {
      game.keypress[event.key] = false;
    };
    const handleKeyDown = (event) => {
      game.keypress[event.key] = true;
    };

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const start = () => {
    game.start();
    socket.emit("start", {
      vx: -game.ball.vx,
      vy: -game.ball.vy,
    });
  };

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById(
      "tutorial"
    ) as HTMLCanvasElement;
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
      game = new PongGame(
        ctx,
        socket,
        setFps,
        setSpeed,
        setPlayer1Position,
        setPlayer2Position
      );
      game.draw_canvas();
      setInterval(game.update, TARGET_FRAME_MS);
    }
  });

  return (
    <>
      <div>
        <Button onClick={start}>Start</Button>
        <Button
          onClick={() => {
            game.switch_battle_mode;
          }}
        >
          Battle
        </Button>
        <Button
          onClick={() => {
            game.switch_practice_mode;
          }}
        >
          Practice
        </Button>
        <div id="fps">FPS: {fps}</div>
        <div id="speed">Speed: {speed}</div>
        <div>
          player1: <span id="player1">{player1Position}</span>
        </div>
        <div>
          player2: <span id="player2">{player2Position}</span>
        </div>
      </div>
      <canvas id="tutorial" width="256" height="512"></canvas>
    </>
  );
}
