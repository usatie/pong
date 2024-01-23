"use client";

import {
  blockUser,
  kickUserOnRoom,
  unblockUser,
  updateRoomUser,
  muteUser,
  unmuteUser,
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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

export interface LeaveEvent {
  userId: number;
  roomId: number;
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
  const [isBlocked, setIsBlocked] = useState(
    blockingUsers.some((u: PublicUserEntity) => u.id === user.userId),
  );
  const [isKicked, setIsKicked] = useState(false);
  const [isMuted, setIsMuted] = useState(
    mutedUsers?.some((u: PublicUserEntity) => u.id === user.userId),
  );
  const [isInviting, setIsInviting] = useState(false);
  useEffect(() => {
    const handleLeftEvent = (data: LeaveEvent) => {
      if (Number(data.userId) === me.userId) {
        router.push("/room");
      }
      if (Number(data.userId) === user.userId) {
        setIsKicked(true);
      }
    };
    socket.on("leave", handleLeftEvent);

    return () => {
      socket.off("leave", handleLeftEvent);
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
  const invite = () => {
    socket.emit("invite-pong", { userId: user.userId });
    setIsInviting(true);
  };
  const cancelInvite = () => {
    socket.emit("invite-cancel-pong", { userId: user.userId });
    setIsInviting(false);
  };
  const mute = async (duration?: number) => {
    const res = await muteUser(room.id, user.userId, duration);
    if (res === "Success") {
      setIsMuted(true);
    }
  };
  const unmute = async () => {
    const res = await unmuteUser(room.id, user.userId);
    if (res === "Success") {
      setIsMuted(false);
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
                {!isInviting && (
                  <ContextMenuItem onSelect={invite}>
                    {/* TODO: disabled when inviting */}
                    Invite
                  </ContextMenuItem>
                )}
                {isInviting && (
                  <ContextMenuItem onSelect={cancelInvite}>
                    Cancel invite
                  </ContextMenuItem>
                )}
                {isMeAdminOrOwner && !isUserOwner && (
                  <>
                    {!isMuted && (
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>Mute</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-46">
                          <ContextMenuItem onSelect={() => mute(60)}>
                            For 5 minutes
                          </ContextMenuItem>
                          <ContextMenuItem onSelect={() => mute(15 * 60)}>
                            For 15 minutes
                          </ContextMenuItem>
                          <ContextMenuItem onSelect={() => mute(60 * 60)}>
                            For 1 Hour
                          </ContextMenuItem>
                          <ContextMenuItem onSelect={() => mute(180 * 60)}>
                            For 3 Hours
                          </ContextMenuItem>
                          <ContextMenuItem onSelect={() => mute(480 * 60)}>
                            For 8 Hours
                          </ContextMenuItem>
                          <ContextMenuItem onSelect={() => mute(1440 * 60)}>
                            For 24 Hours
                          </ContextMenuItem>
                          <ContextMenuItem onSelect={() => mute()}>
                            Indefinite
                          </ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    )}
                    {isMuted && (
                      <ContextMenuItem onSelect={unmute}>
                        Unmute
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem
                      className="text-primary"
                      disabled={isUserOwner}
                      onSelect={kick}
                    >
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
