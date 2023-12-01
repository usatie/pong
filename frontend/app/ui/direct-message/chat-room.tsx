"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { chatSocket as socket } from "@/socket";
import type { User } from "@/app/ui/user/card";
import * as z from "zod";

type PrivateMessage = {
  from: string;
  to: string;
  userName: string;
  text: string;
};

type MessageLog = Array<PrivateMessage>;

const formSchema = z.string().min(1);

export default function ChatRoom({ me, other }: { me: User; other: User }) {
  const [message, setMessage] = useState("");
  const [messageLog, setMessageLog] = useState<MessageLog>([]);
  const myId = me.id.toString();
  const otherId = other.id.toString();

  useEffect(() => {
    socket.connect(); // no-op if the socket is already connected
    socket.emit("joinDM", myId);
    console.log("emit joinDM");

    const handleMessageReceived = (newMessageLog: PrivateMessage) => {
      if (newMessageLog.from === otherId || newMessageLog.from === myId) {
        console.log("received message: ", newMessageLog);
        setMessageLog((oldMessageLogs) => [...oldMessageLogs, newMessageLog]);
        console.log(newMessageLog);
      }
    };
    socket.on("sendToUser", handleMessageReceived);

    return () => {
      console.log(`return from useEffect`);
      socket.off("sendToUser", handleMessageReceived);
      console.log("disconnect");
      socket.disconnect();
    };
  }, [myId, otherId]);

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newMessage = message;
    const result = formSchema.safeParse(newMessage);
    if (result.success) {
      console.log(`privateMassage`, newMessage);
      console.log("name: ", me.name);
      const name = me.name;
      const fromId = myId;
      const toId = otherId;
      socket.emit("privateMessage", {
        from: fromId,
        to: toId,
        userName: name,
        text: newMessage,
      });
      setMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-[600px] grid grid-rows-[min-content_1fr_min-content]">
        <CardHeader>
          <CardTitle>{other.name}</CardTitle>
          <CardDescription>Experimental chat room</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full space-y-1 pr-3">
            <div className="flex gap-3 text-slate-600 text-sm">
              <ul>
                {messageLog.map((message, i) => {
                  return (
                    <div key={i} className="flex gap-3 text-slate-600 text-sm">
                      <li>
                        {message.userName}
                        <div
                          className={cn(
                            "flex justify-center max-w-[500px] p-2 shadow mb-2",
                            "bg-muted rounded-lg",
                          )}
                        >
                          {message.text}
                        </div>
                      </li>
                    </div>
                  );
                })}
              </ul>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form
            className="space-x-2 w-full flex gap-2"
            id="chat-content"
            onSubmit={sendMessage}
          >
            <Input
              placeholder="Message..."
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              type="text"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
