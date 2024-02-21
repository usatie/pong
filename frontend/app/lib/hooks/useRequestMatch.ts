"use client";

import { chatSocket as socket } from "@/socket";
import { useCallback, useState } from "react";

export const useRequestMatch = (userId: number) => {
  const [isRequestingMatch, setIsRequestingMatch] = useState(false);
  const [sendRequestPending, setSendRequestPending] = useState(false);

  const requestMatch = useCallback(async () => {
    setSendRequestPending(true);
    await socket.emit("invite-pong", { userId: userId });
    setIsRequestingMatch(true);
    setSendRequestPending(false);
  }, [userId]);
  const cancelRequestMatch = useCallback(async () => {
    setSendRequestPending(true);
    await socket.emit("invite-cancel-pong", { userId: userId });
    setIsRequestingMatch(false);
    setSendRequestPending(false);
  }, [userId]);

  return {
    isRequestingMatch,
    sendRequestPending,
    requestMatch,
    cancelRequestMatch,
  };
};
