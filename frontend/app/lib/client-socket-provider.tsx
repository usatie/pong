"use client";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { chatSocket } from "@/socket";
import Link from "next/link";
import { useEffect } from "react";
import { useAuthContext } from "./client-auth";
import {
  DenyEvent,
  InviteEvent,
  MatchEvent,
  MessageEvent,
  PublicUserEntity,
} from "./dtos";
import { chatSocket as socket } from "@/socket";
import { useRouter } from "next/navigation";

export default function SocketProvider() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();
  const router = useRouter();

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

  const showMessageToast = (message: MessageEvent) => {
    // TODO: If sender is me, don't show toast
    toast({
      title: `${message.user.name}`,
      description: ` ${message.content}`,
      action: (
        <ToastAction altText="Open" asChild>
          <Link href={`/room/${message.roomId}`}>Open</Link>
        </ToastAction>
      ),
    });
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
    chatSocket.connect();
    const handler = (event: string, data: any) => {
      if (event === "message") {
        showMessageToast(data);
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
      } else {
        showNotificationToast(data);
      }
    };
    chatSocket.onAny(handler);
    return () => {
      chatSocket.offAny(handler);
      chatSocket.disconnect();
    };
  }, [currentUser, toast]);
  return <></>;
}
