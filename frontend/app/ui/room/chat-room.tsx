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

type Chat = {
  userName: string;
  text: string;
  roomId: string;
};

type MessageLog = Array<Chat>;

const formSchema = z.string().min(1);

export default function ChatRoom({
  id,
  user,
  roomName,
}: {
  id: number;
  user: User;
  roomName: string;
}) {
  const [message, setMessage] = useState("");
  const [messageLog, setMessageLog] = useState<MessageLog>([]);

  useEffect(() => {
    const handleMessageReceived = (newMessageLog: Chat) => {
      console.log("received message: ", newMessageLog);
      setMessageLog((oldMessageLogs) => [...oldMessageLogs, newMessageLog]);
      console.log(messageLog);
    };
    socket.on("sendToClient", handleMessageReceived);
    return () => {
      console.log(`return from useEffect`);
      socket.off("sendToClient", handleMessageReceived);
    };
  }, [messageLog]);

  useEffect(() => {
    socket.connect(); // no-op if the socket is already connected
    socket.emit("joinRoom", id);
    console.log("emit joinRoom");

    return () => {
      socket.emit("leaveRoom", id);
      console.log("emit leaveRoom");
      console.log("disconnect");
      socket.disconnect();
    };
  }, [id]);

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newMessage = message;
    const result = formSchema.safeParse(newMessage);
    if (result.success) {
      console.log(`sendMessage`, newMessage);
      console.log("name: ", user.name);
      const name = user.name;
      socket.emit("newMessage", {
        userName: name,
        text: newMessage,
        roomId: id.toString(),
      });
      setMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-[600px] grid grid-rows-[min-content_1fr_min-content]">
        <CardHeader>
          <CardTitle>{roomName} room</CardTitle>
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
