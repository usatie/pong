let game;
let keyName = '';

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 256;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 5;
const PADDLE_COLOR = "#000000";
const BALL_COLOR = "#000000";
const INITIAL_BALL_SPEED = 10;
const TARGET_FPS = 60;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;

// Key Events
document.addEventListener(
  "keydown",
  (event) => {
	game.keypress[event.key] = true;
  },
  false,
);

document.addEventListener(
  "keyup",
  (event) => {
	game.keypress[event.key] = false;
  },
  false,
);

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
		this.color = color
	}

	clear = (ctx) => {
		ctx.clearRect(this.x, this.y, this.width, this.height);
	}

	draw = (ctx) => {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	move_up = () => {
		if (this.y > 0) {
			this.y -= CANVAS_HEIGHT / 100 * 3;
			this.y = Math.round(this.y);
			this.y = clamp(this.y, 0, CANVAS_HEIGHT);
		}
	}

	move_down = () => {
		if (this.y + this.height < CANVAS_HEIGHT) {
			this.y += CANVAS_HEIGHT / 100 * 3;
			this.y = Math.round(this.y);
			this.y = clamp(this.y, 0, CANVAS_HEIGHT);
		}
	}

	collide_with = (ball) => {
		if (ball.y + ball.radius * 2 >= this.y && ball.y <= this.y + this.height) {
			// Ball is actually colliding with paddle
			if (ball.x + ball.radius * 2 >= this.x && ball.x <= this.x + this.width) {
				return true;
			}
			// Ball is out of canvas, but it must be regarded as colliding with paddle
			if ((ball.x <= 0 && this.x == 0) // left paddle
				|| ((ball.x + ball.radius * 2 >= CANVAS_WIDTH) && this.x != 0)) { // right paddle
				return true;
			}
		}
		return false;
	}
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
	}

	draw = (ctx) => {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
	}

	speed = () => {
		return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
	}

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
	}

	fluctuate_velocity_vector = () => {
		let radian = Math.atan2(this.vy, this.vx);
		// Add random fluctuation (5 degree)
		radian += (Math.random() - 0.5) * 5 * Math.PI / 180;
		// clamp absolute value of radian to 45 degree
		if (Math.abs(radian) <= Math.PI / 2) {
			radian = clamp(radian, -Math.PI / 4, Math.PI / 4);
		} else if (radian > Math.PI / 2) {
			radian = clamp(radian, Math.PI * 3 / 4, Math.PI);
		} else {
			radian = clamp(radian, -Math.PI, -Math.PI * 3 / 4);
		}

		let speed = this.speed();
		speed = clamp(speed * this.generate_random_scale(), CANVAS_WIDTH / 100, CANVAS_WIDTH / 10);
		this.vx = speed * Math.cos(radian);
		this.vy = speed * Math.sin(radian);
	}

	reset = () => {
		this.x = CANVAS_WIDTH / 2 - this.radius / 2;
		this.y = CANVAS_HEIGHT / 2 - this.radius / 2;
		this.vx = 0;
		this.vy = 0;
	}

	bounce_off_paddle = (paddle) => {
		this.x = clamp(this.x, paddle.width, CANVAS_WIDTH - paddle.width - this.radius * 2);
		this.vx = -this.vx;
		this.fluctuate_velocity_vector();
	}

	bounce_off_right_paddle = (paddle) => {
		// Right paddle
		if (this.x + this.radius * 2 >= CANVAS_WIDTH - paddle.width) {
			if (paddle.hasCollision(this)) {
				this.x = clamp(this.x, 10, CANVAS_WIDTH - this.radius * 2);
				this.vx = -this.vx;
				this.fluctuate_velocity_vector();
			} else {
				this.reset();
			}
		}
	}

	collide_with_top_bottom = () => {
		return (this.y < 0 || this.y + this.radius * 2 > CANVAS_HEIGHT || this.y < 0)
	}

	bounce_off_top_bottom = () => {
		this.y = clamp(this.y, 0, CANVAS_HEIGHT - this.radius * 2);
		this.vy = -this.vy;
	}

	move = (elapsed) => {
		this.x += this.vx * elapsed / TARGET_FRAME_MS;
		this.y += this.vy * elapsed / TARGET_FRAME_MS;
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
	}
}

class PongGame {
	constructor(ctx) {
		this.ctx = ctx;
		this.ctx.textAlign = "center";
		this.ctx.font = "48px serif";
		this.player1 = new Paddle(
			0, 
			CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, 
			PADDLE_WIDTH, 
			PADDLE_HEIGHT, 
			PADDLE_COLOR);
		this.player2 = new Paddle(
			CANVAS_WIDTH - PADDLE_WIDTH,
			CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, 
			PADDLE_WIDTH, 
			PADDLE_HEIGHT, 
			PADDLE_COLOR);
		this.ball = new Ball(
			CANVAS_WIDTH / 2 - BALL_RADIUS / 2, 
			CANVAS_HEIGHT / 2 - BALL_RADIUS / 2, 
			0, 
			0, 
			BALL_RADIUS, 
			BALL_COLOR);
		this.score = {
			player1: 0,
			player2: 0
		};
		this.updated_at = undefined;
		this.fps_updated_at = undefined;
		this.elapsed = 0;
		this.frame_count = 0;
		this.is_playing = false;
		this.keyName = '';
		this.keypress = {};
	}

	update_fps = () => {
		this.frame_count++;
		if (this.fps_updated_at === undefined) {
			this.fps_updated_at = this.updated_at;
		}
		const elapsed_since_last_update = this.updated_at - this.fps_updated_at;
		if (elapsed_since_last_update > 500) {
			const fps = Math.round(this.frame_count / (elapsed_since_last_update / 1000), 1);
			document.getElementById("fps").innerHTML = "FPS: " + fps;
			this.frame_count = 0;
			this.fps_updated_at = this.updated_at;
		}
	}

	update_speed(speed) {
		document.getElementById("speed").innerHTML = "Speed: " + Math.round(speed);
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
		} else if (this.ball.x <= 0) {
			console.log("collide with left");
			this.ball.reset();
			this.score.player2++;
		} else if (this.ball.x + this.ball.radius * 2 >= CANVAS_WIDTH) {
			console.log("collide with right");
			this.ball.reset();
			this.score.player1++;
		} else if (this.ball.collide_with_top_bottom()) {
			this.ball.bounce_off_top_bottom();
		}
		this.ball.draw(this.ctx);
		this.player1.draw(this.ctx);
		this.player2.draw(this.ctx);
		this.ctx.fillText(this.score.player1, CANVAS_WIDTH * 1 / 4, 100);
		this.ctx.fillText(this.score.player2, CANVAS_WIDTH * 3 / 4, 100);
	}

	update = () => {
		const now = Date.now();
		this.elapsed = (this.updated_at === undefined) ? 0 : now - this.updated_at;
		this.updated_at = now;
		this.update_fps();
		this.update_speed(this.ball.speed());
		if (this.keypress['ArrowUp'] || this.keypress['d']) {
			this.player1.clear(this.ctx);
			this.player1.move_up(this.elapsed);
			this.player1.draw(this.ctx);
		} else if (this.keypress['ArrowDown'] || this.keypress['f']) {
			this.player1.clear(this.ctx);
			this.player1.move_down(this.elapsed);
			this.player1.draw(this.ctx);
		}
		if (this.keypress['j']) {
			this.player2.clear(this.ctx);
			this.player2.move_down(this.elapsed);
			this.player2.draw(this.ctx);
		} else if (this.keypress['k']) {
			this.player2.clear(this.ctx);
			this.player2.move_up(this.elapsed);
			this.player2.draw(this.ctx);
		}
		if (this.is_playing) {
			this.draw_canvas();
		}
	}

	start = () => {
		// Initialize initial velocity of the ball
		let random_radian = (Math.random() - 0.5) * Math.PI / 2;
		if (Math.random() < 0.5) {
			random_radian = -random_radian;
		}
		this.ball.vx = INITIAL_BALL_SPEED * Math.cos(random_radian);
		this.ball.vy = INITIAL_BALL_SPEED * Math.sin(random_radian);
		this.is_playing = true;
	}

	stop = () => {
		this.updated_at = undefined;
		this.ball.vx = 0;
		this.ball.vy = 0;
		this.is_playing = false;
	}

	switch_battle_mode = () => {
		// Make the left player a paddle
		this.player1.clear(this.ctx);
		this.player1 = new Paddle(
			0, 
			CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, 
			PADDLE_WIDTH, 
			PADDLE_HEIGHT, 
			PADDLE_COLOR);
		this.player1.draw(this.ctx);
	}

	switch_practice_mode = () => {
		// Make the left player a wall
		this.player1.clear(this.ctx);
		this.player1 = new Paddle(
			0, 
			0,
			PADDLE_WIDTH, 
			CANVAS_HEIGHT, 
			PADDLE_COLOR);
		this.player1.draw(this.ctx);
	}
}
