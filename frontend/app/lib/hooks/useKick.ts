"use client";

import { kickUserOnRoom } from "@/app/lib/actions";
import type { UserOnRoomEntity } from "@/app/lib/dtos";
import { toast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { chatSocket as socket } from "@/socket";

const showKickErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to kick user",
  });
};

export function useKick(roomId: number, userId: number) {
  const router = useRouter();
  const [kickPending, setKickPending] = useState(false);

  const kick = useCallback(async () => {
    setKickPending(true);
    const res = await kickUserOnRoom(roomId, userId);
    if (res === "Success") {
      setKickPending(false);
    } else {
      showKickErrorToast();
      setKickPending(false);
    }
  }, [roomId, userId]);
  return { kickPending, kick };
}
