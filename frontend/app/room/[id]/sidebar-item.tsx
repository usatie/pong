"use client";

import {
  blockUser,
  kickUserOnRoom,
  unblockUser,
  updateRoomUser,
} from "@/app/lib/actions";
import type {
  PublicUserEntity,
  RoomEntity,
  UserOnRoomEntity,
} from "@/app/lib/dtos";
import { SmallAvatarSkeleton } from "@/app/ui/room/skeleton";
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

function truncateString(str: string | undefined, num: number): string {
  if (!str) {
    return "";
  }
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

function Avatar({ avatarURL }: { avatarURL?: string }) {
  if (!avatarURL) {
    return <SmallAvatarSkeleton />;
  }
  return <img className="rounded-full w-6 h-6 object-cover" src={avatarURL} />;
}

export default function SidebarItem({
  room,
  user,
  me,
  blockingUsers,
}: {
  room: RoomEntity;
  user: UserOnRoomEntity;
  me: UserOnRoomEntity;
  blockingUsers: PublicUserEntity[];
}) {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(
    blockingUsers.some((u: PublicUserEntity) => u.id === user.userId),
  );
  const [isKicked, setIsKicked] = useState(false);
  useEffect(() => {
    const handleLeftEvent = (userId: string) => {
      if (Number(userId) === me.userId) {
        router.push("/room");
      }
      if (Number(userId) === user.userId) {
        setIsKicked(true);
      }
    };
    socket.on("left-room", handleLeftEvent);

    return () => {
      socket.off("left-room", handleLeftEvent);
    };
  }, [user.userId, me.userId, router]);

  const isUserAdmin = user.role === "ADMINISTRATOR";
  const isUserOwner = user.role === "OWNER";
  const isMeAdminOrOwner = me.role === "ADMINISTRATOR" || me.role === "OWNER";

  const openProfile = () => {
    if (user.userId === me.userId) {
      router.push("/settings");
    } else {
      router.push(`/user/${user.userId}`);
    }
  };
  //TODO: pending to implement
  const block = async () => {
    const res = await blockUser(user.userId);
    if (res === "Success") {
      setIsBlocked(true);
    }
  };
  const unblock = async () => {
    const res = await unblockUser(user.userId);
    if (res === "Success") {
      setIsBlocked(false);
    }
  };
  const kick = () => kickUserOnRoom(room.id, user.userId);
  const updateUserRole = isUserAdmin
    ? () => updateRoomUser("MEMBER", room.id, user.userId)
    : () => updateRoomUser("ADMINISTRATOR", room.id, user.userId);
  return (
    <>
      {!isKicked && (
        <ContextMenu>
          <ContextMenuTrigger className="flex gap-2 items-center group hover:opacity-60">
            <Avatar avatarURL={user.user.avatarURL} />
            <span className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
              {truncateString(user.user.name, 15)}
              {room.accessLevel !== "DIRECT" && isUserOwner && " 👑"}
              {room.accessLevel !== "DIRECT" && isUserAdmin && " 🛡"}
            </span>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem onSelect={openProfile}>Go profile</ContextMenuItem>
            {user.userId !== me.userId && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem disabled={isBlocked} onSelect={block}>
                  Block
                </ContextMenuItem>
                <ContextMenuItem disabled={!isBlocked} onSelect={unblock}>
                  Unblock
                </ContextMenuItem>
                {isMeAdminOrOwner && !isUserOwner && (
                  <>
                    <ContextMenuItem disabled={isUserOwner} onSelect={kick}>
                      Kick
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={updateUserRole}>
                      {isUserAdmin ? "Remove admin role" : "Promote to Admin"}
                    </ContextMenuItem>
                  </>
                )}
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      )}
    </>
  );
}
