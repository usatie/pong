"use client";

import { kickUserOnRoom } from "@/app/lib/actions";
import type { LeaveRoomEvent } from "@/app/lib/dtos";
import { toast } from "@/components/ui/use-toast";
import { chatSocket as socket } from "@/socket";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const showKickErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to kick user",
  });
};

export function useKick(roomId: number, userId: number, meId: number) {
  const router = useRouter();
  const [kickPending, setKickPending] = useState(false);
  const pathName = usePathname();

  const handleLeaveRoomEvent = useCallback(
    (data: LeaveRoomEvent) => {
      if (
        pathName === "/room/" + data.roomId.toString() &&
        data.userId === meId
      ) {
        router.push("/room");
        router.refresh();
      } else if (pathName === "/room/" + data.roomId.toString()) {
        router.refresh();
      } else if (
        (pathName.startsWith("/room/") || pathName === "/room") &&
        meId === data.userId
      ) {
        router.refresh();
      }
    },
    [meId, pathName, router],
  );

  useEffect(() => {
    socket.on("leave-room", handleLeaveRoomEvent);
    return () => {
      socket.off("leave-room", handleLeaveRoomEvent);
    };
  }, [handleLeaveRoomEvent]);

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
