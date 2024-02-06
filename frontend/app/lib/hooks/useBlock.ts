"use client";

import { blockUser, unblockUser } from "@/app/lib/actions";
import type { PublicUserEntity } from "@/app/lib/dtos";
import { toast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";

const showBlockErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to block user",
  });
};

const showUnblockErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to unblock user",
  });
};

export function useBlock(userId: number, blockingUsers: PublicUserEntity[]) {
  const [blockPending, setBlockPending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(
    blockingUsers.some((u) => u.id === userId),
  );
  const block = useCallback(async () => {
    setBlockPending(true);
    const res = await blockUser(userId);
    if (res === "Success") {
      setIsBlocked(true);
      setBlockPending(false);
    } else {
      showBlockErrorToast();
      setBlockPending(false);
    }
  }, [userId]);
  const unblock = useCallback(async () => {
    setBlockPending(true);
    const res = await unblockUser(userId);
    if (res === "Success") {
      setIsBlocked(false);
      setBlockPending(false);
    } else {
      showUnblockErrorToast();
      setBlockPending(false);
    }
  }, [userId]);
  return {
    blockPending,
    isBlocked,
    block,
    unblock,
  };
}
