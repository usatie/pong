"use client";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { chatSocket } from "@/socket";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useAuthContext } from "./client-auth";
import {
  DenyEvent,
  DeleteRoomEvent,
  EnterRoomEvent,
  InviteEvent,
  LeaveRoomEvent,
  MatchEvent,
  MessageEvent,
  PublicUserEntity,
} from "./dtos";
import { chatSocket as socket } from "@/socket";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function SocketProvider() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();
  const pathName = usePathname();
  const router = useRouter();

  const showDeleteRoomNotificationToast = () => {
    toast({
      title: "Notification",
      description: "The chat room has been deleted",
    });
  };

  const handleDeleteRoomEvent = useCallback(
    (data: DeleteRoomEvent) => {
      if (pathName === "/room/" + data.roomId.toString()) {
        showDeleteRoomNotificationToast();
        router.push("/room");
        router.refresh();
      } else if (
        pathName.startsWith("/room/") ||
        pathName === "/explore-rooms"
      ) {
        router.refresh();
      }
    },
    [pathName, router],
  );

  const handleEnterRoomEvent = useCallback(
    (data: EnterRoomEvent) => {
      if (pathName === "/room/" + data.roomId.toString()) {
        router.refresh();
      } else if (
        (pathName.startsWith("/room/") || pathName === "/room") &&
        currentUser?.id === data.userId
      ) {
        router.refresh();
      }
    },
    [currentUser, pathName, router],
  );

  const handleLeaveRoomEvent = useCallback(
    (data: LeaveRoomEvent) => {
      if (
        pathName === "/room/" + data.roomId.toString() &&
        data.userId === currentUser?.id
      ) {
        router.push("/room");
        router.refresh();
      } else if (pathName === "/room/" + data.roomId.toString()) {
        router.refresh();
      } else if (
        (pathName.startsWith("/room/") || pathName === "/room") &&
        currentUser?.id === data.userId
      ) {
        router.refresh();
      }
    },
    [currentUser, pathName, router],
  );

  const MatchPong = (data: MatchEvent) => {
    router.push(`/pong/${data.roomId}?mode=player`);
  };

  const showInvitePongToast = (message: InviteEvent) => {
    toast({
      title: `user id: ${message.userId}`,
      description: ` invited you to play pong!`,
      action: (
        <ToastAction altText="approve" asChild>
          <>
            <button
              onClick={() => {
                socket.emit("approve-pong", {
                  userId: message.userId,
                });
              }}
            >
              approve
            </button>
            <button
              onClick={() => {
                socket.emit("deny-pong", {
                  userId: message.userId,
                });
              }}
            >
              Deny
            </button>
          </>
        </ToastAction>
      ),
    });
  };

  const handleOnlineStatus = (users: { userId: number; status: number }[]) => {
    toast({
      title: "online-status",
      description: JSON.stringify(users),
    });
  };

  const showMessageToast = (message: MessageEvent) => {
    if (message.user.id !== currentUser?.id) {
      toast({
        title: `${message.user.name}`,
        description: ` ${message.content}`,
        action: (
          <ToastAction altText="Open" asChild>
            <Link href={`/room/${message.roomId}`}>Open</Link>
          </ToastAction>
        ),
      });
    }
  };

  const showNotificationToast = (data: any) => {
    toast({
      title: `${data.title}`,
      description: ` ${data.description}`,
    });
  };

  const showDenyPongToast = (data: DenyEvent) => {
    toast({
      title: `Your invite was denied`,
    });
  };

  const showErrorPongToast = (data: any) => {
    toast({
      title: `Error`,
      description: ` ${data}`,
    });
  };

  const showInviteCancelPongToast = (data: PublicUserEntity) => {
    toast({
      title: `Invite canceled by ${data.name}`,
    });
  };

  useEffect(() => {
    const handler = (event: string, data: any) => {
      if (event === "message") {
        showMessageToast(data);
      } else if (event === "delete-room") {
        handleDeleteRoomEvent(data);
      } else if (event === "enter-room") {
        handleEnterRoomEvent(data);
      } else if (event === "leave") {
        handleLeaveRoomEvent(data);
      } else if (
        event === "mute" ||
        event === "unmute" ||
        event === "update-role"
      ) {
        /* Nothing to do here */
      } else if (event === "invite-pong") {
        showInvitePongToast(data);
      } else if (event === "invite-cancel-pong") {
        showInviteCancelPongToast(data);
      } else if (event === "match-pong") {
        MatchPong(data);
      } else if (event === "deny-pong") {
        showDenyPongToast(data);
      } else if (event === "error-pong") {
        showErrorPongToast(data);
      } else if (event === "online-status") {
        handleOnlineStatus(data);
      } else {
        showNotificationToast(data);
      }
    };
    chatSocket.onAny(handler);
    chatSocket.connect();
    return () => {
      chatSocket.offAny(handler);
      chatSocket.disconnect();
    };
  }, [
    currentUser,
    handleDeleteRoomEvent,
    handleEnterRoomEvent,
    handleLeaveRoomEvent,
    toast,
  ]);
  return <></>;
}
