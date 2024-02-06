"use client";

import { useCallback, useState } from "react";
import { chatSocket as socket } from "@/socket";

export const useInviteToGame = (userId: number) => {
  const [isInvitingToGame, setIsInvitingToGame] = useState(false);
  const [invitePending, setInvitePending] = useState(false);

  const inviteToGame = useCallback(async () => {
    setInvitePending(true);
    await socket.emit("invite-pong", { userId: userId });
    setIsInvitingToGame(true);
    setInvitePending(false);
  }, [userId]);
  const cancelInviteToGame = useCallback(async () => {
    setInvitePending(true);
    await socket.emit("invite-cancel-pong", { userId: userId });
    setIsInvitingToGame(false);
    setInvitePending(false);
  }, [userId]);

  return {
    invitePending,
    isInvitingToGame,
    inviteToGame,
    cancelInviteToGame,
  };
};
