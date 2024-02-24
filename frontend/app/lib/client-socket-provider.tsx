"use client";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { chatSocket, chatSocket as socket } from "@/socket";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "./client-auth";
import {
  ApprovedMatchRequestEvent,
  MessageEvent,
  PublicUserEntity,
  RequestMatchEvent,
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

  const goToMatch = (data: ApprovedMatchRequestEvent) => {
    router.push(`/pong/${data.roomId}?mode=player`);
  };

  const showMatchRequestToast = (message: RequestMatchEvent) => {
    console.log("showMatchRequestToast", message);
    toast({
      title: `user id: ${message.requestingUserId}`,
      description: ` invited you to play pong!`,
      action: (
        <ToastAction altText="approve" asChild>
          <>
            <button
              onClick={() => {
                socket.emit("approve-match-request", {
                  approvedUserId: message.requestingUserId,
                });
              }}
            >
              approve
            </button>
            <button
              onClick={() => {
                socket.emit("deny-match-request", {
                  deniedUserId: message.requestingUserId,
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

  const showDeniedMatchRequestToast = () => {
    toast({
      title: `Your invite was denied`,
    });
  };

  const showInvalidRequestToast = (data: string) => {
    toast({
      title: `Error`,
      description: ` ${data}`,
    });
  };

  const showCancelledMatchRequestToast = (data: PublicUserEntity) => {
    toast({
      title: `Invite cancelled by ${data.name}`,
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
        showMatchRequestToast(data);
      } else if (event === "cancelled-match-request") {
        showCancelledMatchRequestToast(data);
      } else if (event === "approved-match-request") {
        goToMatch(data);
      } else if (event === "denied-match-request") {
        showDeniedMatchRequestToast();
      } else if (event === "invalid-request") {
        showInvalidRequestToast(data);
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
