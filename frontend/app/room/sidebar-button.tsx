"use client";

import { deleteRoomUser, updateRoomUser } from "@/app/lib/actions";
import { SmallAvatarSkeleton } from "@/app/ui/room/skeleton";
import type { User } from "@/app/ui/user/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { chatSocket as socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [myRole, setMyRole] = useState(myInfo.role);
  const [userRole, setUserRole] = useState(user.role);

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
    socket.emit("kick", { roomId, userId: user.id });
  };

  const handleCheckboxChange = (roomId: number, user: User) => {
    if (!isChecked) {
      updateRoomUser("ADMINISTRATOR", roomId, user.id);
      socket.emit("updateRole", {
        roomId,
        userId: user.id,
        role: "ADMINISTRATOR",
      });
      setChecked(true);
    } else {
      updateRoomUser("MEMBER", roomId, user.id);
      socket.emit("updateRole", { roomId, userId: user.id, role: "MEMBER" });
      setChecked(false);
    }
  };

  useEffect(() => {
    const handleUpdateRole = (role: string, userId: number) => {
      if (role === "MEMBER" || role === "ADMINISTRATOR") {
        console.log("role", role);
        if (userId === myInfo.userId) {
          setMyRole(role);
        }
        if (userId === user.id) {
          setUserRole(role);
        }
      } else {
        console.error("invalid role");
      }
    };
    socket.on("updateRole", handleUpdateRole);

    return () => {
      socket.off("updateRole", handleUpdateRole);
    };
  }, [myInfo.userId, user.id]);

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
              {userRole === "OWNER" && "👑"}
              {userRole === "ADMINISTRATOR" && "🛡"}
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem inset>Go profile</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            inset
            disabled={isBlocked || myInfo.userId === user.id}
          >
            <button onClick={() => blockUser(user)}>Block</button>
          </ContextMenuItem>
          <ContextMenuItem
            inset
            disabled={!isBlocked || myInfo.userId === user.id}
          >
            <button onClick={() => unblockUser(user)}>Unblock</button>
          </ContextMenuItem>
          {(myRole === "ADMINISTRATOR" || myRole === "OWNER") &&
            myInfo.userId !== user.id && (
              <ContextMenuItem inset disabled={userRole === "OWNER"}>
                <button onClick={() => kickUser(roomId, user)}>Kick</button>
              </ContextMenuItem>
            )}
          {myRole === "OWNER" && myInfo.userId !== user.id && (
            <ContextMenuItem inset disabled={userRole === "OWNER"}>
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
