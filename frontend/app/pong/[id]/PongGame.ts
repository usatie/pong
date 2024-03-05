import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import {
  BALL_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  INITIAL_BALL_SPEED,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  TARGET_FRAME_MS,
} from "./const";

type setFunction<T> = (value: T | ((prevState: T) => T)) => void;
type movingDirectionType = "none" | "left" | "right";
type onActionType = (action: string) => void;
type userModeType = "player" | "viewer";

export class PongGame {
  private ctx: CanvasRenderingContext2D;
  private player1: Paddle;
  private player2: Paddle;
  private ball: Ball;
  private score: { player1: number; player2: number };
  private updatedAt: number;
  private fpsUpdatedAt: number;
  private elapsed: number;
  private frameCount: number;
  private isPlaying: boolean;
  private movingDirection: movingDirectionType = "none";

  onAction: onActionType | undefined;
  private userMode: userModeType;

  constructor(
    ctx: CanvasRenderingContext2D,
    paddleColor: string,
    ballColor: string,
    userMode: userModeType,
  ) {
    this.ctx = ctx;
    this.ctx.textAlign = "center";
    this.ctx.font = "48px serif";
    this.player1 = this.initPlayer1(paddleColor);
    this.player2 = this.initPlayer2(paddleColor);

    this.ball = new Ball(
      CANVAS_HEIGHT,
      CANVAS_WIDTH,
      TARGET_FRAME_MS,
      CANVAS_WIDTH / 2 - BALL_RADIUS / 2,
      CANVAS_HEIGHT / 2 - BALL_RADIUS / 2,
      0,
      0,
      BALL_RADIUS,
      ballColor,
    );
    this.score = {
      player1: 0,
      player2: 0,
    };
    this.updatedAt = Date.now();
    this.fpsUpdatedAt = Date.now();
    this.elapsed = 0;
    this.frameCount = 0;
    this.isPlaying = false;
    this.userMode = userMode;
  }

  updateFps = () => {
    this.frameCount++;
    if (this.fpsUpdatedAt === undefined) {
      this.fpsUpdatedAt = this.updatedAt;
    }
    const elapsed_since_last_update = this.updatedAt - this.fpsUpdatedAt;
    if (elapsed_since_last_update > 500) {
      const fps = Math.round(
        this.frameCount / (elapsed_since_last_update / 1000),
      );
      this.frameCount = 0;
      this.fpsUpdatedAt = this.updatedAt;
    }
  };

  drawCanvas = () => {
    // Clear objects
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw objects
    this.ball.move(this.elapsed);
    if (this.player1.collideWith(this.ball)) {
      if (this.userMode === "player") {
        this.ball.bounceOffPaddle(this.player1);
        this.onAction && this.onAction("bounce");
      }
    } else if (this.ball.x <= 0) {
      if (this.userMode === "player") {
        this.ball.reset();
        this.score.player2++;
        this.onAction && this.onAction("collide");
      }
    } else if (this.ball.collideWithTopBottom()) {
      this.ball.bounceOffTopBottom();
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
    this.elapsed = this.updatedAt === undefined ? 0 : now - this.updatedAt;
    this.updatedAt = now;
    if (this.userMode === "player") {
      if (this.movingDirection === "left") {
        this.player1.clear(this.ctx);
        this.player1.moveTop();
        this.player1.draw(this.ctx);
        this.onAction && this.onAction("left");
      } else if (this.movingDirection === "right") {
        this.player1.clear(this.ctx);
        this.player1.moveDown();
        this.player1.draw(this.ctx);
        this.onAction && this.onAction("right");
      }
    }
    if (this.isPlaying) {
      this.drawCanvas();
    }
  };

  start = ({ vx, vy }: { vx: number | undefined; vy: number | undefined }) => {
    this.isPlaying = true;
    if (vx && vy) {
      this.ball.vx = vx;
      this.ball.vy = vy;
      return { vx, vy };
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
    return { vx: this.ball.vx, vy: this.ball.vy };
  };

  stop = () => {
    this.updatedAt = Date.now();
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.isPlaying = false;
  };

  resetPlayerPosition = () => {
    const color = this.player1.color;
    this.player1 = this.initPlayer1(color);
    this.player2 = this.initPlayer2(color);
    this.drawCanvas();
  };

  initPlayer1 = (paddleColor: string) =>
    new Paddle(
      0,
      CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      paddleColor,
    );

  initPlayer2 = (paddleColor: string) =>
    new Paddle(
      CANVAS_WIDTH - PADDLE_WIDTH,
      CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      paddleColor,
    );

  bounceOffPaddlePlayer1 = () => {
    return this.ball.bounceOffPaddle(this.player1);
  };

  bounceOffPaddlePlayer2 = () => {
    return this.ball.bounceOffPaddle(this.player2);
  };

  movePlayer1Left = () => {
    this.player1.clear(this.ctx);
    this.player1.moveTop();
    this.player1.draw(this.ctx);
  };

  movePlayer1Right = () => {
    this.player1.clear(this.ctx);
    this.player1.moveDown();
    this.player1.draw(this.ctx);
  };

  movePlayer2Left = () => {
    this.player2.clear(this.ctx);
    this.player2.moveTop();
    this.player2.draw(this.ctx);
  };

  movePlayer2Right = () => {
    this.player2.clear(this.ctx);
    this.player2.moveDown();
    this.player2.draw(this.ctx);
  };

  increaseScorePlayer1 = () => {
    return ++this.score.player1;
  };

  increaseScorePlayer2 = () => {
    return ++this.score.player2;
  };

  endRound = () => {
    this.ball.reset();
    this.drawCanvas();
  };

  setMovingDirection = (direction: movingDirectionType) => {
    this.movingDirection = direction;
  };

  setColor(color: string) {
    this.ball.color = color;
    this.player1.color = color;
    this.player2.color = color;
  }
}
