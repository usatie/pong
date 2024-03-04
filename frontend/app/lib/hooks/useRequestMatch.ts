"use client";

import { chatSocket as socket } from "@/socket";
import { useCallback, useState } from "react";

export const useRequestMatch = (userId: number) => {
  const [isRequestingMatch, setIsRequestingMatch] = useState(false);
  const [sendRequestPending, setSendRequestPending] = useState(false);

  const handleDenyMatchRequest = useCallback(() => {
    setIsRequestingMatch(false);
    socket.off("denied-match-request", handleDenyMatchRequest);
  }, [userId]);
  const requestMatch = useCallback(async () => {
    setSendRequestPending(true);
    socket.on("denied-match-request", handleDenyMatchRequest);
    await socket.emit("request-match", { requestedUserId: userId });
    setIsRequestingMatch(true);
    setSendRequestPending(false);
  }, [userId]);
  const cancelRequestMatch = useCallback(async () => {
    setSendRequestPending(true);
    await socket.emit("cancel-match-request", { requestedUserId: userId });
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
