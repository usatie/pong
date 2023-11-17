export default function Page() {
  let game;
  let keyName = "";

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
  socket.on("connection");
  socket.on("connect", () => {
    console.log(`Connected: ${socket.id}`);

    socket.emit("join");
  });

  socket.on("start", (data) => {
    console.log(`Start: ${JSON.stringify(data)}`);
    game.start(data);
  });

  socket.on("opponentLeft", () => {
    const canvas = document.getElementById("tutorial");
    const ctx = canvas.getContext("2d");
    game = new PongGame(ctx);
    game.draw_canvas();
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
  document.addEventListener(
    "keydown",
    (event) => {
      game.keypress[event.key] = true;
    },
    false
  );

  document.addEventListener(
    "keyup",
    (event) => {
      game.keypress[event.key] = false;
    },
    false
  );

  const start = () => {
    game.start();
    params = {
      vx: -game.ball.vx,
      vy: -game.ball.vy,
    };
    socket.emit("start", params);
  };

  function init() {
    const canvas = document.getElementById("tutorial");
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
      game = new PongGame(ctx);
      game.draw_canvas();
      setInterval(game.update, TARGET_FRAME_MS);
    }
  }

  function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

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

  class PongGame {
    constructor(ctx) {
      this.ctx = ctx;
      this.ctx.textAlign = "center";
      this.ctx.font = "48px serif";
      this.player1 = new Paddle(
        CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        CANVAS_HEIGHT - PADDLE_HEIGHT,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        PADDLE_COLOR
      );
      this.player2 = new Paddle(
        CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        0,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        PADDLE_COLOR
      );
      this.ball = new Ball(
        CANVAS_WIDTH / 2 - BALL_RADIUS / 2,
        CANVAS_HEIGHT / 2 - BALL_RADIUS / 2,
        0,
        0,
        BALL_RADIUS,
        BALL_COLOR
      );
      this.score = {
        player1: 0,
        player2: 0,
      };
      this.updated_at = undefined;
      this.fps_updated_at = undefined;
      this.elapsed = 0;
      this.frame_count = 0;
      this.is_playing = false;
      this.keyName = "";
      this.keypress = {};
    }

    update_fps = () => {
      this.frame_count++;
      if (this.fps_updated_at === undefined) {
        this.fps_updated_at = this.updated_at;
      }
      const elapsed_since_last_update = this.updated_at - this.fps_updated_at;
      if (elapsed_since_last_update > 500) {
        const fps = Math.round(
          this.frame_count / (elapsed_since_last_update / 1000),
          1
        );
        document.getElementById("fps").innerHTML = "FPS: " + fps;
        this.frame_count = 0;
        this.fps_updated_at = this.updated_at;
      }
    };

    update_speed(speed) {
      document.getElementById("speed").innerHTML =
        "Speed: " + Math.round(speed);
    }

    update_players() {
      document.getElementById("player1").innerHTML = this.player1.x;
      document.getElementById("player2").innerHTML = this.player2.x;
    }

    draw_canvas = () => {
      // Clear objects
      this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw objects
      this.ball.move(this.elapsed);
      if (this.player1.collide_with(this.ball)) {
        this.ball.bounce_off_paddle(this.player1);
      } else if (this.player2.collide_with(this.ball)) {
        this.ball.bounce_off_paddle(this.player2);
      } else if (this.ball.y <= 0) {
        console.log("collide with top");
        this.ball.reset();
        this.score.player2++;
      } else if (this.ball.y + this.ball.radius * 2 >= CANVAS_HEIGHT) {
        console.log("collide with bottom");
        this.ball.reset();
        this.score.player1++;
      } else if (this.ball.collide_with_side()) {
        this.ball.bounce_off_side();
      }
      this.ball.draw(this.ctx);
      this.player1.draw(this.ctx);
      this.player2.draw(this.ctx);
      this.ctx.fillText(this.score.player1, (CANVAS_WIDTH * 1) / 4, 100);
      this.ctx.fillText(this.score.player2, (CANVAS_WIDTH * 3) / 4, 100);
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
        this.player1.move_left(this.elapsed);
        this.player1.draw(this.ctx);
        socket.emit("left");
      } else if (this.keypress["ArrowRight"]) {
        this.player1.clear(this.ctx);
        this.player1.move_right(this.elapsed);
        this.player1.draw(this.ctx);
        socket.emit("right");
      }
      if (this.is_playing) {
        this.draw_canvas();
      }
    };

    start = ({ vx, vy } = { vx: undefined, vy: undefined }) => {
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
      this.updated_at = undefined;
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
        PADDLE_COLOR
      );
      this.player2.draw(this.ctx);
    };

    switch_practice_mode = () => {
      // Make the left player a wall
      this.player2.clear(this.ctx);
      this.player2 = new Paddle(
        0,
        0,
        CANVAS_WIDTH,
        PADDLE_HEIGHT,
        PADDLE_COLOR
      );
      this.player2.draw(this.ctx);
    };
  }
}
