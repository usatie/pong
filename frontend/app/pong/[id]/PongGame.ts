import { Socket } from "socket.io-client";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import {
  BALL_COLOR,
  BALL_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  INITIAL_BALL_SPEED,
  PADDLE_COLOR,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  TARGET_FRAME_MS,
} from "./const";

type setFunction<T> = (value: T | ((prevState: T) => T)) => void;

export class PongGame {
  ctx!: CanvasRenderingContext2D;
  player1: Paddle;
  player2: Paddle;
  ball: Ball;
  score: { player1: number; player2: number };
  updated_at: number;
  fps_updated_at: number;
  elapsed: number;
  frame_count: number;
  is_playing: boolean;
  keypress: { [key: string]: boolean };

  setFps: setFunction<number>;
  setSpeed: setFunction<number>;
  setPlayer1Position: setFunction<number>;
  setPlayer2Position: setFunction<number>;

  socket: Socket;

  constructor(
    socket: Socket,
    setFps: setFunction<number>,
    setSpeed: setFunction<number>,
    setPlayer1Position: setFunction<number>,
    setPlayer2Position: setFunction<number>,
  ) {
    this.player1 = this.initPlayer1();
    this.player2 = this.initPlayer2();
    this.ball = new Ball(
      CANVAS_HEIGHT,
      CANVAS_WIDTH,
      TARGET_FRAME_MS,
      CANVAS_WIDTH / 2 - BALL_RADIUS / 2,
      CANVAS_HEIGHT / 2 - BALL_RADIUS / 2,
      0,
      0,
      BALL_RADIUS,
      BALL_COLOR,
    );
    this.score = {
      player1: 0,
      player2: 0,
    };
    this.updated_at = Date.now();
    this.fps_updated_at = Date.now();
    this.elapsed = 0;
    this.frame_count = 0;
    this.is_playing = false;
    this.keypress = {};
    this.socket = socket;
    this.setFps = setFps;
    this.setSpeed = setSpeed;
    this.setPlayer1Position = setPlayer1Position;
    this.setPlayer2Position = setPlayer2Position;
  }

  // call only after rendering finishes
  setup_canvas = (ctx: CanvasRenderingContext2D) => {
    // todo
    this.ctx = ctx;
    this.ctx.textAlign = "center";
    this.ctx.font = "48px serif";
  };

  update_fps = () => {
    this.frame_count++;
    if (this.fps_updated_at === undefined) {
      this.fps_updated_at = this.updated_at;
    }
    const elapsed_since_last_update = this.updated_at - this.fps_updated_at;
    if (elapsed_since_last_update > 500) {
      const fps = Math.round(
        this.frame_count / (elapsed_since_last_update / 1000),
      );
      this.setFps(fps);
      this.frame_count = 0;
      this.fps_updated_at = this.updated_at;
    }
  };

  update_speed(speed: number) {
    this.setSpeed(speed);
  }

  update_players() {
    this.setPlayer1Position(this.player1.x);
    this.setPlayer2Position(this.player2.x);
  }

  draw_canvas = () => {
    // Clear objects
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw objects
    this.ball.move(this.elapsed);
    if (this.player1.collide_with(this.ball)) {
      this.ball.bounce_off_paddle(this.player1);
      this.socket.emit("bounce");
    } else if (this.ball.y + this.ball.radius * 2 >= CANVAS_HEIGHT) {
      console.log("collide with bottom");
      this.ball.reset();
      this.score.player2++;
      this.socket.emit("collide");
    } else if (this.ball.collide_with_side()) {
      this.ball.bounce_off_side();
    }
    this.ball.draw(this.ctx);
    this.player1.draw(this.ctx);
    this.player2.draw(this.ctx);
    this.ctx.fillText(
      this.score.player1.toString(),
      (CANVAS_WIDTH * 1) / 4,
      100,
    );
    this.ctx.fillText(
      this.score.player2.toString(),
      (CANVAS_WIDTH * 3) / 4,
      100,
    );
  };

  update = () => {
    const now = Date.now();
    this.elapsed = this.updated_at === undefined ? 0 : now - this.updated_at;
    this.updated_at = now;
    this.update_fps();
    this.update_speed(this.ball.speed());
    this.update_players();
    if (this.keypress["ArrowLeft"]) {
      this.player1.clear(this.ctx);
      this.player1.move_left();
      this.player1.draw(this.ctx);
      this.socket.emit("left");
    } else if (this.keypress["ArrowRight"]) {
      this.player1.clear(this.ctx);
      this.player1.move_right();
      this.player1.draw(this.ctx);
      this.socket.emit("right");
    }
    if (this.is_playing) {
      this.draw_canvas();
    }
  };

  start = (
    { vx, vy }: { vx: number | undefined; vy: number | undefined } = {
      vx: undefined,
      vy: undefined,
    },
  ) => {
    this.is_playing = true;
    if (vx && vy) {
      this.ball.vx = vx;
      this.ball.vy = vy;
      return;
    }
    // Initialize initial velocity of the ball
    while (true) {
      let random_radian = Math.random() * 2 * Math.PI;
      this.ball.vx = INITIAL_BALL_SPEED * Math.cos(random_radian);
      this.ball.vy = INITIAL_BALL_SPEED * Math.sin(random_radian);
      if (
        Math.abs(Math.cos(random_radian)) >= 0.5 &&
        Math.abs(Math.sin(random_radian)) >= 0.5
      ) {
        break;
      }
    }
  };

  stop = () => {
    this.updated_at = Date.now();
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.is_playing = false;
  };

  switch_battle_mode = () => {
    // Make the left player a paddle
    this.player2.clear(this.ctx);
    this.player2 = new Paddle(
      CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      0,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      PADDLE_COLOR,
    );
    this.player2.draw(this.ctx);
  };

  switch_practice_mode = () => {
    // Make the left player a wall
    this.player2.clear(this.ctx);
    this.player2 = new Paddle(0, 0, CANVAS_WIDTH, PADDLE_HEIGHT, PADDLE_COLOR);
    this.player2.draw(this.ctx);
  };

  resetPlayerPosition = () => {
    this.player1 = this.initPlayer1();
    this.player2 = this.initPlayer2();
    this.draw_canvas();
  };

  initPlayer1 = () =>
    new Paddle(
      CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      CANVAS_HEIGHT - PADDLE_HEIGHT,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      PADDLE_COLOR,
    );

  initPlayer2 = () =>
    new Paddle(
      CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      0,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      PADDLE_COLOR,
    );
}
