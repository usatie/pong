"use client";

import { updateRoomUser } from "@/app/lib/actions";
import type { UserOnRoomEntity } from "@/app/lib/dtos";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { chatSocket as socket } from "@/socket";

type Role = "ADMINISTRATOR" | "MEMBER";

interface UpdateRoleEvent {
  roomId: number;
  userId: number;
  role: Role;
}

const showUpdateRoleErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to update user role",
  });
};

export function useUpdateRole(
  roomId: number,
  me: UserOnRoomEntity,
  user: UserOnRoomEntity,
) {
  const [updateRolePending, setUpdateRolePending] = useState(false);
  const [userRole, setUserRole] = useState(user.role);
  const [meRole, setMeRole] = useState(me.role);
  const isUserAdmin = userRole === "ADMINISTRATOR";
  useEffect(() => {
    const handleUpdateRoleEvent = (data: UpdateRoleEvent) => {
      if (data.roomId === roomId && data.userId === user.userId) {
        setUserRole(data.role);
      } else if (data.roomId === roomId && data.userId === me.userId) {
        setMeRole(data.role);
      }
    };
    socket.on("update-role", handleUpdateRoleEvent);

    return () => {
      socket.off("update-role", handleUpdateRoleEvent);
    };
  }, [roomId, me.userId, user.userId]);

  const updateUserRole = useCallback(async () => {
    setUpdateRolePending(true);
    const res = await updateRoomUser(
      isUserAdmin ? "MEMBER" : "ADMINISTRATOR",
      roomId,
      user.userId,
    );
    if (res !== "Success") {
      showUpdateRoleErrorToast();
      setUpdateRolePending(false);
    } else {
      setUserRole(isUserAdmin ? "MEMBER" : "ADMINISTRATOR");
      setUpdateRolePending(false);
    }
  }, [roomId, user.userId, isUserAdmin]);
  return {
    updateRolePending,
    meRole,
    userRole,
    updateUserRole,
  };
}
