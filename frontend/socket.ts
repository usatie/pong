import { io } from "socket.io-client";
export const socket = io("http://" + `${process.env.NEXT_PUBLIC_WEB_URL}`);
