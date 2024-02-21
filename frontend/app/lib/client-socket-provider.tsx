"use client";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { chatSocket, chatSocket as socket } from "@/socket";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "./client-auth";
import {
  DenyEvent,
  InviteEvent,
  MatchEvent,
  MessageEvent,
  PublicUserEntity,
} from "./dtos";

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

  const handleOnlineStatus = (
    users: { userId: number; status: number; name: string }[],
  ) => {
    const description = users.map((u) => {
      return `[${u.name} has logged ${u.status === 1 ? "in" : "out"}] `;
    });
    toast({
      title: "online-status",
      description,
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
      } else if (
        event === "delete-room" ||
        event === "enter-room" ||
        event === "leave-room" ||
        event === "mute" ||
        event === "unmute" ||
        event === "update-role"
      ) {
        /* Nothing to do here */
      } else if (event === "request-match") {
        showInvitePongToast(data);
      } else if (event === "cancel-request-match") {
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
  }, [currentUser, toast]);
  return <></>;
}
