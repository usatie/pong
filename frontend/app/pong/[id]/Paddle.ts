import { clamp } from "@/lib/utils";
import { Ball } from "./Ball";
import { CANVAS_HEIGHT } from "./const";

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  clear = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(this.x, this.y, this.width, this.height);
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  move_top = () => {
    this.y -= (CANVAS_HEIGHT / 100) * 3;
    this.y = Math.round(this.y);
    this.y = clamp(this.y, 0, CANVAS_HEIGHT - this.height);
  };

  move_down = () => {
    this.y += (CANVAS_HEIGHT / 100) * 3;
    this.y = Math.round(this.y);
    this.y = clamp(this.y, 0, CANVAS_HEIGHT - this.height);
  };

  collide_with = (ball: Ball) => {
    // Ball is in the same y-axis
    if (ball.y >= this.y && ball.y + ball.radius * 2 <= this.y + this.height) {
      // Ball is actually colliding with paddle
      const isLeftPaddle = this.x == 0;
      if (
        (ball.x <= this.width && isLeftPaddle) ||
        (ball.x + ball.radius * 2 >= this.x && !isLeftPaddle)
      ) {
        return true;
      }
    }
    return false;
  };
}
