"use client";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { chatSocket } from "@/socket";
import Link from "next/link";
import { useEffect } from "react";
import { useAuthContext } from "./client-auth";
import { MessageEvent } from "./dtos";

export default function SocketProvider() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

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

  useEffect(() => {
    chatSocket.connect();
    const handler = (event: string, data: any) => {
      if (event === "message") {
        showMessageToast(data);
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
