"use client";

import { muteUser, unmuteUser } from "@/app/lib/actions";
import type { PublicUserEntity } from "@/app/lib/dtos";
import { toast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import { chatSocket as socket } from "@/socket";

interface MuteEvent {
  userId: number;
  roomId: number;
}

const showMuteErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to mute user",
  });
};

const showUnmuteErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to unmute user",
  });
};

export function useMute(
  roomId: number,
  userId: number,
  mutedUsers: PublicUserEntity[],
) {
  const [mutePending, setMutePending] = useState(false);
  const [isMuted, setIsMuted] = useState(
    mutedUsers.some((u: PublicUserEntity) => u.id === userId),
  );

  const mute = useCallback(
    async (duration?: number) => {
      setMutePending(true);
      const res = await muteUser(roomId, userId, duration);
      if (res === "Success") {
        setIsMuted(true);
        setMutePending(false);
      } else {
        showMuteErrorToast();
        setMutePending(false);
      }
    },
    [roomId, userId],
  );
  const unmute = useCallback(async () => {
    setMutePending(true);
    const res = await unmuteUser(roomId, userId);
    if (res === "Success") {
      setIsMuted(false);
      setMutePending(false);
    } else {
      showUnmuteErrorToast();
      setMutePending(false);
    }
  }, [roomId, userId]);
  return { mutePending, isMuted, mute, unmute };
}
