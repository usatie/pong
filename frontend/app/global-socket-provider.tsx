"use client";

import { io } from "socket.io-client";

export function GlobalSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // This socket ensures that the Socket.IO client is used consistently throughout the app.
  // Without this, separate instances of the Socket.IO client in different components could
  // lead to disconnection attempts and potential race conditions.
  io();
  return children as JSX.Element;
}
