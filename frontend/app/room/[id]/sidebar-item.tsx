"use client";

import {
  UserOnRoom,
  blockUser,
  deleteUserOnRoom,
  unblockUser,
  updateRoomUser,
} from "@/app/lib/actions";
import { SmallAvatarSkeleton } from "@/app/ui/room/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function truncateString(str: string | undefined, num: number): string {
  if (!str) {
    return "";
  }
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export default function SidebarItem({
  roomId,
  user,
  me,
}: {
  roomId: number;
  user: UserOnRoom;
  me: UserOnRoom;
}) {
  const isUserAdmin = user.role === "ADMINISTRATOR";
  const isUserOwner = user.role === "OWNER";
  const isMeAdminOrOwner = me.role === "ADMINISTRATOR" || me.role === "OWNER";
  const isBlocked = false; // TODO: user.blockedBy.contains((u) => u.id === me.userId);
  const block = () => blockUser(user.userId);
  const unblock = () => unblockUser(user.userId);
  const kick = () => deleteUserOnRoom(roomId, user.userId);
  const updateUserRole = isUserAdmin
    ? () => updateRoomUser("MEMBER", roomId, user.userId)
    : () => updateRoomUser("ADMINISTRATOR", roomId, user.userId);
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="flex gap-2 items-center group hover:opacity-60">
          <SmallAvatarSkeleton />
          <span className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
            {truncateString(user.user.name, 15)}
            {isUserOwner && " 👑"}
            {isUserAdmin && " 🛡"}
          </span>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem>Go profile</ContextMenuItem>
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
