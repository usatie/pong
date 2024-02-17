"use client";

import type {
  DeleteRoomEvent,
  EnterRoomEvent,
  PublicUserEntity,
  RoomEntity,
  UserOnRoomEntity,
} from "@/app/lib/dtos";
import { Avatar } from "@/app/ui/user/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBlock } from "@/app/lib/hooks/useBlock";
import { useInviteToGame } from "@/app/lib/hooks/useInviteToGame";
import { useKick } from "@/app/lib/hooks/useKick";
import { useMute } from "@/app/lib/hooks/useMute";
import { useUpdateRole } from "@/app/lib/hooks/useUpdateRole";
import MuteMenu from "./mute-menu";
import { chatSocket as socket } from "@/socket";

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
  room,
  user,
  me,
  blockingUsers,
  mutedUsers,
}: {
  room: RoomEntity;
  user: UserOnRoomEntity;
  me: UserOnRoomEntity;
  blockingUsers: PublicUserEntity[];
  mutedUsers: PublicUserEntity[];
}) {
  const router = useRouter();
  const { blockPending, isBlocked, block, unblock } = useBlock(
    user.userId,
    blockingUsers,
  );
  const { invitePending, isInvitingToGame, inviteToGame, cancelInviteToGame } =
    useInviteToGame(user.userId);
  const { kickPending, kick } = useKick(room.id, user.userId, me.userId);
  const { mutePending, isMuted, mute, unmute } = useMute(
    room.id,
    user.userId,
    mutedUsers,
  );
  const { updateRolePending, meRole, userRole, updateUserRole } = useUpdateRole(
    room.id,
    me,
    user,
  );
  const isUserAdmin = userRole === "ADMINISTRATOR";
  const isUserOwner = userRole === "OWNER";
  const isMeAdminOrOwner = meRole === "ADMINISTRATOR" || meRole === "OWNER";

  const openProfile = () => {
    if (user.userId === me.userId) {
      router.push("/settings");
    } else {
      router.push(`/user/${user.userId}`);
    }
  };
  const handleEnterRoomEvent = useCallback(
    (data: EnterRoomEvent) => {
      if (room.id === data.roomId) {
        router.refresh();
      }
    },
    [router, room.id],
  );
  const handleDeleteRoomEvent = useCallback(
    (data: DeleteRoomEvent) => {
      if (room.id === data.roomId) {
        router.push("/room");
        router.refresh();
      } else {
        router.refresh();
      }
    },
    [room.id, router],
  );

  useEffect(() => {
    socket.on("enter-room", handleEnterRoomEvent);
    socket.on("delete-room", handleDeleteRoomEvent);
    return () => {
      socket.off("enter-room", handleEnterRoomEvent);
      socket.off("delete-room", handleDeleteRoomEvent);
    };
  }, [handleEnterRoomEvent, handleDeleteRoomEvent]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="flex gap-2 items-center group hover:opacity-60">
          <Avatar
            avatarURL={user.user.avatarURL}
            size="small"
            id={user.userId}
          />
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
              <ContextMenuItem
                disabled={isBlocked || blockPending}
                onSelect={block}
              >
                Block
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!isBlocked || blockPending}
                onSelect={unblock}
              >
                Unblock
              </ContextMenuItem>
              {!isInvitingToGame && (
                <ContextMenuItem
                  disabled={invitePending}
                  onSelect={inviteToGame}
                >
                  Invite
                </ContextMenuItem>
              )}
              {isInvitingToGame && (
                <ContextMenuItem
                  disabled={invitePending}
                  onSelect={cancelInviteToGame}
                >
                  Cancel invite
                </ContextMenuItem>
              )}
              {isMeAdminOrOwner && !isUserOwner && (
                <>
                  {!isMuted && (
                    <MuteMenu
                      isMuted={isMuted}
                      mutePending={mutePending}
                      roomId={room.id}
                      userId={user.userId}
                      mute={mute}
                    />
                  )}
                  {isMuted && (
                    <ContextMenuItem disabled={mutePending} onSelect={unmute}>
                      Unmute
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem
                    className="text-primary"
                    disabled={isUserOwner || kickPending}
                    onSelect={kick}
                  >
                    Kick
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={updateRolePending}
                    onSelect={updateUserRole}
                  >
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
