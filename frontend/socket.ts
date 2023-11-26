import { io } from "socket.io-client";
export const socket = io(process.env.NEXT_PUBLIC_WEB_URL! + "/chat", {
  path: "/socket.io/chat/",
  autoConnect: false,
});

export const pongSocket = io(process.env.NEXT_PUBLIC_WEB_URL! + "/pong", {
  autoConnect: false,
});
