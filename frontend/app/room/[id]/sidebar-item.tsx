"use client";

import {
  blockUser,
  getBlockingUsers,
  kickUserOnRoom,
  unblockUser,
  updateRoomUser,
} from "@/app/lib/actions";
import type { PublicUserEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import { SmallAvatarSkeleton } from "@/app/ui/room/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  roomId,
  user,
  me,
}: {
  roomId: number;
  user: UserOnRoomEntity;
  me: UserOnRoomEntity;
}) {
  const [isBlocked, setIsBlocked] = useState(false);
  const isUserAdmin = user.role === "ADMINISTRATOR";
  const isUserOwner = user.role === "OWNER";
  const isMeAdminOrOwner = me.role === "ADMINISTRATOR" || me.role === "OWNER";

  useEffect(() => {
    const fetchGetBlockingUsers = async () => {
      const blockingUsers = await getBlockingUsers();
      const isBlocked = blockingUsers.some(
        (u: PublicUserEntity) => u.id === user.userId,
      );
      setIsBlocked(isBlocked);
    };
    fetchGetBlockingUsers();
  }, []);
  const router = useRouter();
  const openProfile = () => {
    if (user.userId === me.userId) {
      router.push("/settings");
    } else {
      router.push(`/user/${user.userId}`);
    }
  };
  const block = () => {
    blockUser(user.userId);
    setIsBlocked(true);
  };
  const unblock = () => {
    unblockUser(user.userId);
    setIsBlocked(false);
  };
  const kick = () => kickUserOnRoom(roomId, user.userId);
  const updateUserRole = isUserAdmin
    ? () => updateRoomUser("MEMBER", roomId, user.userId)
    : () => updateRoomUser("ADMINISTRATOR", roomId, user.userId);
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="flex gap-2 items-center group hover:opacity-60">
          <Avatar avatarURL={user.user.avatarURL} />
          <span className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
            {truncateString(user.user.name, 15)}
            {isUserOwner && " 👑"}
            {isUserAdmin && " 🛡"}
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
    </>
  );
}
