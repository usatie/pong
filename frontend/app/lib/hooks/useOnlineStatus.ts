"use client";

import { chatSocket } from "@/socket";
import { createContext, useEffect, useState } from "react";

export const OnlineContext = createContext<{ [key: number]: number }>({});

export function useOnlineStatus(): { [key: number]: number } {
  const [onlineStatus, setOnlineStatus] = useState<{ [key: number]: number }>(
    {},
  );
  useEffect(() => {
    const handleOnlineStatus = (
      users: { userId: number; status: number }[],
    ) => {
      users.forEach((u) => {
        setOnlineStatus((prev) => ({ ...prev, [u.userId]: u.status }));
      });
    };
    chatSocket.on("online-status", handleOnlineStatus);
    return () => {
      chatSocket.off("online-status", handleOnlineStatus);
    };
  });
  return onlineStatus;
}
