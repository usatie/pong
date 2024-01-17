import { io } from "socket.io-client";
export const chatSocket = io(process.env.NEXT_PUBLIC_WEB_URL! + "/chat", {
  autoConnect: false,
});
