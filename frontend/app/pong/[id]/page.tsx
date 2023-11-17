"use client";
import { Button } from "@/components/ui/button";
import io from "Socket.IO-client";
import { useEffect } from "react";

const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 512;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 5;
const PADDLE_COLOR = "#000000";
const BALL_COLOR = "#000000";
const INITIAL_BALL_SPEED = 10;
const TARGET_FPS = 60;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;

const socket = io("https://pong.shunusami.com/");

export default function Page() {
  let game;

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
    game.player2.move_left(game.elapsed);
    game.player2.draw(game.ctx);
  });

  socket.on("left", () => {
    game.player2.clear(game.ctx);
    game.player2.move_right(game.elapsed);
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
    params = {
      vx: -game.ball.vx,
      vy: -game.ball.vy,
    };
    socket.emit("start", params);
  };

  useEffect(() => {
    const canvas = document.getElementById("tutorial");
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
      game = new PongGame(ctx);
      game.draw_canvas();
      setInterval(game.update, TARGET_FRAME_MS);
    }
  });

  function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

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
        <div id="fps">FPS: 0</div>
        <div id="speed">Speed: 0</div>
        <div>
          player1: <span id="player1">0</span>
        </div>
        <div>
          player2: <span id="player2">0</span>
        </div>
      </div>
      <canvas id="tutorial" width="256" height="512"></canvas>
    </>
  );
}
