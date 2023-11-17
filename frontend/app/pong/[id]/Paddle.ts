class Paddle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  clear = (ctx) => {
    ctx.clearRect(this.x, this.y, this.width, this.height);
  };

  draw = (ctx) => {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  move_left = () => {
    if (this.x > 0) {
      this.x -= (CANVAS_WIDTH / 100) * 3;
      this.x = Math.round(this.x);
      this.x = clamp(this.x, 0, CANVAS_WIDTH);
    }
  };

  move_right = () => {
    if (this.x + this.width < CANVAS_WIDTH) {
      this.x += (CANVAS_WIDTH / 100) * 3;
      this.x = Math.round(this.x);
      this.x = clamp(this.x, 0, CANVAS_WIDTH);
    }
  };

  collide_with = (ball) => {
    // Ball is in the same x-axis
    if (ball.x >= this.x && ball.x + ball.radius * 2 <= this.x + this.width) {
      // Ball is actually colliding with paddle
      if (
        (ball.y <= this.height && this.y == 0) ||
        (ball.y + ball.radius * 2 >= this.y && this.y != 0)
      ) {
        return true;
      }
    }
    return false;
  };
}
