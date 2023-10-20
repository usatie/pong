let canvas;
let ctx;
let ball1;
let paddle1;
let last_time_display_fps = Date.now();
let start;
let elapsed_ms = 0;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 5;
const INITIAL_BALL_SPEED = 10;
const TARGET_FPS = 60;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;

function startAnimation() {
	let speed = INITIAL_BALL_SPEED;
	let random_radian = (Math.random() - 0.5) * Math.PI / 2;
	if (Math.random() < 0.5) {
		random_radian = -random_radian;
	}
	let vx = speed * Math.cos(random_radian);
	let vy = speed * Math.sin(random_radian);
	ball1.vx = vx;
	ball1.vy = vy;
}

function stopAnimation() {
	start = undefined;
	ball1.vx = 0;
	ball1.vy = 0;
}

function draw() {
	canvas = document.getElementById("tutorial");
	if (canvas.getContext) {
	  ctx = canvas.getContext("2d");
	  draw_full_canvas();
	  let centerX = canvas.width / 2;
	  let centerY = canvas.height / 2;
	  ball1 = new ball(centerX - BALL_RADIUS, centerY - BALL_RADIUS, 0, 0, BALL_RADIUS, "rgb(200, 0, 0)");
	  ball1.draw(ctx);
	  paddle1 = new paddle(0, 10, PADDLE_WIDTH, PADDLE_HEIGHT, "rgb(0, 0, 0)");
	  paddle1.draw(ctx);
	  setInterval(anim, TARGET_FRAME_MS);
	}
}

let count = 0;
let keyName = '';

document.addEventListener(
  "keydown",
  (event) => {
    keyName = event.key;
  },
  false,
);

document.addEventListener(
  "keyup",
  (event) => {
    keyName = '';
  },
  false,
);

function update_fps() {
	count++;
	if (start - last_time_display_fps > 1000) {
		document.getElementById("fps").innerHTML = "FPS: " + count;
		count = 0;
		last_time_display_fps = start;
	}
}

function update_speed(speed) {
	document.getElementById("speed").innerHTML = "Speed: " + Math.round(speed);
}

function anim() {
	if (start === undefined) {
		start = Date.now();
	}
	const now = Date.now();
	elapsed = now - start;
	start = now;
	update_fps();
	paddle1.clear(ctx);
	ball1.clear(ctx);
	if (keyName === 'ArrowUp') {
		paddle1.move_up();
	} else if (keyName === 'ArrowDown') {
		paddle1.move_down();
	}
	paddle1.draw(ctx);
	ball1.move();
	ball1.draw(ctx);
}

function draw_full_canvas() {
	function setSize() {
	  canvas.height = innerHeight - 100;
	  canvas.width = innerWidth - 100;
	}
	if (canvas.getContext) {
	  setSize();
	}
}

function clamp(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

class paddle {
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
			this.y -= canvas.height / 100 * 3;
			this.y = Math.round(this.y);
			this.y = clamp(this.y, 0, canvas.height);
		}
	}

	move_down = () => {
		if (this.y + this.height < canvas.height) {
			this.y += canvas.height / 100 * 3;
			this.y = Math.round(this.y);
			this.y = clamp(this.y, 0, canvas.height);
		}
	}

	hasCollision = (ball) => {
		if (ball.y + ball.radius * 2 >= this.y && ball.y <= this.y + this.height) {
			// Ball is actually colliding with paddle
			if (ball.x + ball.radius * 2 >= this.x && ball.x <= this.x + this.width) {
				return true;
			}
			// Ball is out of canvas, but it must be regarded as colliding with paddle
			if (ball.x <= 0 || ball.x + ball.radius * 2 >= canvas.width) {
				return true;
			}
		}
		return false;
	}
}

class ball {
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
		speed = clamp(speed * this.generate_random_scale(), canvas.width / 100, canvas.width / 10);
		this.vx = speed * Math.cos(radian);
		this.vy = speed * Math.sin(radian);
		update_speed(speed);
	}

	reset = () => {
		this.x = canvas.width / 2 - this.radius / 2;
		this.y = canvas.height / 2 - this.radius / 2;
		this.vx = 0;
		this.vy = 0;
	}

	bounce_x = () => {
		if (this.x + this.radius * 2 > canvas.width) {
			this.x = clamp(this.x, 0, canvas.width - this.radius * 2);
			// this.x to be integer
			this.vx = -this.vx;
			this.fluctuate_velocity_vector();
		} else if (this.x < PADDLE_WIDTH) { // paddle is 10px wide from x = 0
			if (paddle1.hasCollision(this)) {
				this.x = clamp(this.x, PADDLE_WIDTH, canvas.width - this.radius * 2);
				this.vx = -this.vx;
				this.fluctuate_velocity_vector();
			} else {
				this.reset();
			}
		}
	}

	bounce_y = () => {
		if (this.y + this.radius * 2 > canvas.height || this.y < 0) {
			this.y = clamp(this.y, 0, canvas.height - this.radius * 2);
			this.vy = -this.vy;
		}
	}

	move = () => {
		this.x += this.vx * elapsed / TARGET_FRAME_MS;
		this.y += this.vy * elapsed / TARGET_FRAME_MS;
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.bounce_x();
		this.bounce_y();
	}
}
