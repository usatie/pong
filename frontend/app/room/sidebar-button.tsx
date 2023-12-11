"use client";

import { SmallAvatarSkeleton } from "@/app/chat/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Stack } from "@/app/ui/layout/stack";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { chatSocket as socket } from "@/socket";
import type { User } from "@/app/ui/user/card";
import { updateRoomUser, deleteRoomUser } from "@/app/lib/actions";
import type { UserOnRoom, UserWithRole } from "./sidebar";

function truncateString(str: string | undefined, num: number): string {
  if (!str) {
    return "";
  }
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export function SidebarButton({
  roomId,
  user,
  myInfo,
}: {
  roomId: number;
  user: UserWithRole<User>;
  myInfo: UserOnRoom;
}) {
  console.log("role", user.role);
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isChecked, setChecked] = useState(
    user.role === "OWNER" || user.role === "ADMINISTRATOR",
  );
  const isMeOwner = myInfo.role === "OWNER";
  const isMeAdmin = myInfo.role === "OWNER" || myInfo.role === "ADMINISTRATOR";
  const isOwner = user.role === "OWNER";
  let isAdmin = user.role === "OWNER" || user.role === "ADMINISTRATOR";

  const handleOnClick = () => {
    router.push(`/room/${roomId}`);
  };

  const blockUser = (user: User) => {
    socket.emit("block", user.id);
    setIsBlocked(true);
  };

  const unblockUser = (user: User) => {
    socket.emit("unblock", user.id);
    setIsBlocked(false);
  };

  const kickUser = (roomId: number, user: User) => {
    deleteRoomUser(roomId, user.id);
    socket.emit("kick", user.id);
  };

  const handleCheckboxChange = (roomId: number, user: User) => {
    if (!isChecked) {
      updateRoomUser("ADMINISTRATOR", roomId, user.id);
      setChecked(true);
    } else {
      updateRoomUser("MEMBER", roomId, user.id);
      setChecked(false);
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => handleOnClick()}
            className="flex gap-2 items-center group hover:opacity-60"
          >
            <SmallAvatarSkeleton />
            <span className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
              {truncateString(user.name, 15)}
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem inset>Go profile</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset disabled={isBlocked}>
            <button onClick={() => blockUser(user)}>Block</button>
          </ContextMenuItem>
          <ContextMenuItem inset disabled={!isBlocked}>
            <button onClick={() => unblockUser(user)}>Unblock</button>
          </ContextMenuItem>
          {isMeAdmin && myInfo.userId !== user.id && (
            <ContextMenuItem inset disabled={isOwner}>
              <button onClick={() => kickUser(roomId, user)}>Kick</button>
            </ContextMenuItem>
          )}
          {isMeOwner && myInfo.userId !== user.id && (
            <ContextMenuItem inset disabled={isOwner}>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={isChecked}
                  onCheckedChange={() => handleCheckboxChange(roomId, user)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  admin
                </label>
              </div>
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
