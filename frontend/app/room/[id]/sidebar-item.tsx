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
import { useEffect, useState, useTransition } from "react";
import MuteMenu from "./mute-menu";

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
  const [blockState, setBlockState] = useState({
    isBlocked: blockingUsers.some(
      (u: PublicUserEntity) => u.id === user.userId,
    ),
    isClicked: false,
  });
  const [kickState, setKickState] = useState({
    isKicked: false,
    isClicked: false,
  });
  const [muteState, setMuteState] = useState({
    isMuted: mutedUsers?.some((u: PublicUserEntity) => u.id === user.userId),
    isClicked: false,
  });
  const [inviteState, setInviteState] = useState({
    isInviting: false,
    isClicked: false,
  });
  const [isUpdateRoleClicked, setIsUpdateRoleClicked] = useState(false);

  useEffect(() => {
    const handleLeftEvent = (data: LeaveEvent) => {
      if (Number(data.userId) === me.userId) {
        router.push("/room");
      }
      if (Number(data.userId) === user.userId) {
        setKickState({ ...kickState, isKicked: true });
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
  const block = async () => {
    setBlockState({ ...blockState, isClicked: true });
    const res = await blockUser(user.userId);
    if (res === "Success") {
      setBlockState({ isBlocked: true, isClicked: false });
    } else {
      setBlockState({ ...blockState, isClicked: false });
    }
  };
  const unblock = async () => {
    setBlockState({ ...blockState, isClicked: true });
    const res = await unblockUser(user.userId);
    if (res === "Success") {
      setBlockState({ isBlocked: false, isClicked: false });
    } else {
      setBlockState({ ...blockState, isClicked: false });
    }
  };
  const invite = () => {
    setInviteState({ ...inviteState, isClicked: true });
    socket.emit("invite-pong", { userId: user.userId });
    setInviteState({ isInviting: true, isClicked: false });
  };
  const cancelInvite = () => {
    setInviteState({ ...inviteState, isClicked: true });
    socket.emit("invite-cancel-pong", { userId: user.userId });
    setInviteState({ isInviting: false, isClicked: false });
  };
  const mute = async (duration?: number) => {
    setMuteState({ ...muteState, isClicked: true });
    const res = await muteUser(room.id, user.userId, duration);
    if (res === "Success") {
      setMuteState({ isMuted: true, isClicked: false });
    } else {
      setMuteState({ ...muteState, isClicked: false });
    }
  };
  const unmute = async () => {
    setMuteState({ ...muteState, isClicked: true });
    const res = await unmuteUser(room.id, user.userId);
    if (res === "Success") {
      setMuteState({ isMuted: false, isClicked: false });
    } else {
      setMuteState({ ...muteState, isClicked: false });
    }
  };
  const kick = async () => {
    setKickState({ ...kickState, isClicked: true });
    const res = await kickUserOnRoom(room.id, user.userId);
    if (res === "Success") {
      setKickState({ isKicked: true, isClicked: false });
    } else {
      setKickState({ ...kickState, isClicked: false });
    }
  };
  const updateUserRole = async () => {
    setIsUpdateRoleClicked(true);
    const res = await updateRoomUser(
      isUserAdmin ? "MEMBER" : "ADMINISTRATOR",
      room.id,
      user.userId,
    );
    setIsUpdateRoleClicked(false);
  };
  return (
    <>
      {!kickState.isKicked && (
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
                <ContextMenuItem
                  disabled={blockState.isBlocked || blockState.isClicked}
                  onSelect={block}
                >
                  Block
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={!blockState.isBlocked || blockState.isClicked}
                  onSelect={unblock}
                >
                  Unblock
                </ContextMenuItem>
                {!inviteState.isInviting && (
                  <ContextMenuItem
                    disabled={inviteState.isClicked}
                    onSelect={invite}
                  >
                    Invite
                  </ContextMenuItem>
                )}
                {inviteState.isInviting && (
                  <ContextMenuItem
                    disabled={inviteState.isClicked}
                    onSelect={cancelInvite}
                  >
                    Cancel invite
                  </ContextMenuItem>
                )}
                {isMeAdminOrOwner && !isUserOwner && (
                  <>
                    {!muteState.isMuted && (
                      <MuteMenu
                        muteState={muteState}
                        roomId={room.id}
                        userId={user.userId}
                        mute={mute}
                      />
                    )}
                    {muteState.isMuted && (
                      <ContextMenuItem
                        disabled={muteState.isClicked}
                        onSelect={unmute}
                      >
                        Unmute
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem
                      className="text-primary"
                      disabled={isUserOwner || kickState.isClicked}
                      onSelect={kick}
                    >
                      Kick
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={kickState.isKicked}
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
      )}
    </>
  );
}
