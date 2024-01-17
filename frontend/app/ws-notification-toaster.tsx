"use client";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { chatSocket } from "@/socket";
import Link from "next/link";
import { useEffect } from "react";
import { MessageEvent } from "./lib/dtos";

export default function WSNotificationToaster() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (event: string, data: any) => {
      console.log(event, data);
      if (event === "message") {
        const message = data as MessageEvent;
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
      } else {
        toast({
          title: event,
          description: `${JSON.stringify(data)}`,
        });
      }
    };
    chatSocket.onAny(handler);
    return () => {
      chatSocket.offAny(handler);
    };
  });
  return <></>;
}
