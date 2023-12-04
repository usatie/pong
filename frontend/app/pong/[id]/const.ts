export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 1000;
export const PADDLE_WIDTH = Math.round(CANVAS_WIDTH / 4 / 4) * 4;
export const PADDLE_HEIGHT = Math.round(CANVAS_HEIGHT / 64);
export const BALL_RADIUS = Math.round(CANVAS_WIDTH / 64);
export const INITIAL_BALL_SPEED = CANVAS_HEIGHT / 128;
export const TARGET_FPS = 60;
export const TARGET_FRAME_MS = 1000 / TARGET_FPS;
