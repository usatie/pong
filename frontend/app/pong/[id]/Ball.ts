class Ball {
  constructor(x, y, vx, vy, radius, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  clear = (ctx) => {
    ctx.clearRect(this.x, this.y, this.radius * 2, this.radius * 2);
  };

  draw = (ctx) => {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
  };

  speed = () => {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  };

  // 0.4 ~ 2.5
  generate_random_scale = () => {
    // 0.2 ~ 1.0
    let scale = 0.4 + Math.random() * 0.6;
    // 50% chance to be 1 / scale
    if (Math.random() < 0.5) {
      return 1 / scale;
    } else {
      return scale;
    }
  };

  fluctuate_velocity_vector = () => {
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
      speed * this.generate_random_scale(),
      CANVAS_HEIGHT / 100,
      CANVAS_HEIGHT / 10
    );
    this.vx = speed * Math.cos(radian);
    this.vy = speed * Math.sin(radian);
  };

  reset = () => {
    this.x = CANVAS_WIDTH / 2 - this.radius / 2;
    this.y = CANVAS_HEIGHT / 2 - this.radius / 2;
    this.vx = 0;
    this.vy = 0;
  };

  bounce_off_paddle = (paddle) => {
    this.y = clamp(
      this.y,
      paddle.height,
      CANVAS_HEIGHT - paddle.height - this.radius * 2
    );
    this.vy = -this.vy;
    // this.fluctuate_velocity_vector();
  };

  collide_with_side = () => {
    return this.x < 0 || this.x + this.radius * 2 > CANVAS_WIDTH;
  };

  bounce_off_side = () => {
    this.x = clamp(this.x, 0, CANVAS_WIDTH - this.radius * 2);
    this.vx = -this.vx;
  };

  move = (elapsed) => {
    this.x += (this.vx * elapsed) / TARGET_FRAME_MS;
    this.y += (this.vy * elapsed) / TARGET_FRAME_MS;
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  };
}
