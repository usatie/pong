let canvas;
let ctx;
let ball1;
let paddle1;
let last_time_display_fps = new Date().getTime();

function startAnimation() {
	let speed = 10;
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
	  ball1 = new ball(centerX - 5, centerY - 5, 0, 0, 10, "rgb(200, 0, 0)");
	  ball1.draw(ctx);
	  paddle1 = new paddle(0, 10, 10, canvas.height / 2, "rgb(0, 0, 0)");
	  paddle1.draw(ctx);
	  anim();
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
	let current_time = new Date().getTime();
	if (current_time - last_time_display_fps > 1000) {
		document.getElementById("fps").innerHTML = "FPS: " + count;
		count = 0;
		last_time_display_fps = current_time;
	}
}

function update_speed(speed) {
	document.getElementById("speed").innerHTML = "Speed: " + Math.round(speed);
}

function anim() {
	update_fps();
	if (keyName === 'ArrowUp') {
		paddle1.clear(ctx);
		paddle1.move_up();
	} else if (keyName === 'ArrowDown') {
		paddle1.clear(ctx);
		paddle1.move_down();
	}
	ball1.clear(ctx);
	ball1.move();
	ball1.draw(ctx);
	paddle1.draw(ctx);
	requestAnimationFrame(anim);
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
		if (ball.y + ball.radius >= this.y && ball.y <= this.y + this.height) {
			// Ball is actually colliding with paddle
			if (ball.x + ball.radius >= this.x && ball.x <= this.x + this.width) {
				return true;
			}
			// Ball is out of canvas, but it must be regarded as colliding with paddle
			if (ball.x <= 0 || ball.x + ball.radius >= canvas.width) {
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
		ctx.clearRect(this.x, this.y, this.radius, this.radius);
	}

	draw = (ctx) => {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.fillRect(this.x, this.y, this.radius, this.radius);
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
		if (this.x + this.radius > canvas.width) {
			this.x = clamp(this.x, 0, canvas.width - this.radius);
			// this.x to be integer
			this.vx = -this.vx;
			this.fluctuate_velocity_vector();
		} else if (this.x < 10) { // paddle is 10px wide from x = 0
			if (paddle1.hasCollision(this)) {
				this.x = clamp(this.x, 0, canvas.width - this.radius);
				this.vx = -this.vx;
				this.fluctuate_velocity_vector();
			} else {
				this.reset();
			}
		}
	}

	bounce_y = () => {
		if (this.y + this.radius > canvas.height || this.y < 0) {
			this.y = clamp(this.y, 0, canvas.height - this.radius);
			this.vy = -this.vy;
		}
	}

	move = () => {
		this.x += this.vx;
		this.y += this.vy;
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.bounce_x();
		this.bounce_y();
	}
}
