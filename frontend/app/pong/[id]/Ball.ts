import { clamp } from "@/lib/utils";
import { Paddle } from "./Paddle";

export class Ball {
  canvasHeight: number;
  canvasWidth: number;
  targetFrameMs: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;

  constructor(
    canvasHeight: number,
    canvasWidth: number,
    targetFrameMs: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number,
    color: string,
  ) {
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.targetFrameMs = targetFrameMs;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  clear = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(this.x, this.y, this.radius * 2, this.radius * 2);
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
  };

  speed = () => {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  };

  // 0.4 ~ 2.5
  generateRandomScale = () => {
    // 0.2 ~ 1.0
    let scale = 0.4 + Math.random() * 0.6;
    // 50% chance to be 1 / scale
    if (Math.random() < 0.5) {
      return 1 / scale;
    } else {
      return scale;
    }
  };

  fluctuateVelocityVector = () => {
    let radian = Math.atan2(this.vy, this.vx);
    // Add random fluctuation (5 degree)
    radian += ((Math.random() - 0.5) * 5 * Math.PI) / 180;
    // clamp absolute value of radian to 45 degree
    if (Math.abs(radian) <= Math.PI / 2) {
      radian = clamp(radian, -Math.PI / 4, Math.PI / 4);
    } else if (radian > Math.PI / 2) {
      radian = clamp(radian, (Math.PI * 3) / 4, Math.PI);
    } else {
      radian = clamp(radian, -Math.PI, (-Math.PI * 3) / 4);
    }

    let speed = this.speed();
    speed = clamp(
      speed * this.generateRandomScale(),
      this.canvasWidth / 100,
      this.canvasWidth / 10,
    );
    this.vx = speed * Math.cos(radian);
    this.vy = speed * Math.sin(radian);
  };

  reset = () => {
    this.x = this.canvasWidth / 2 - this.radius / 2;
    this.y = this.canvasHeight / 2 - this.radius / 2;
    this.vx = 0;
    this.vy = 0;
  };

  bounceOffPaddle = (paddle: Paddle) => {
    this.x = clamp(
      this.x,
      paddle.width,
      this.canvasWidth - paddle.width - this.radius * 2,
    );
    this.vx = -this.vx;
    // this.fluctuateVelocityVector();
  };

  collideWithTopBottom = () => {
    return this.y < 0 || this.y + this.radius * 2 > this.canvasHeight;
  };

  bounceOffTopBottom = () => {
    this.y = clamp(this.y, 0, this.canvasHeight - this.radius * 2);
    this.vy = -this.vy;
  };

  move = (elapsed: number) => {
    this.x += (this.vx * elapsed) / this.targetFrameMs;
    this.y += (this.vy * elapsed) / this.targetFrameMs;
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  };
}
