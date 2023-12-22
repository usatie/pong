"use client";
import { useAuthContext } from "@/app/lib/client-auth";
import { Stack } from "@/app/ui/layout/stack";
import { groupMessagesByUser, useScrollToBottom } from "@/app/ui/room/helper";
import { MessageGroup } from "@/app/ui/room/message-group";
import { MessageSkeleton } from "@/app/ui/room/skeleton";
import { Message } from "@/app/ui/room/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatSocket as socket } from "@/socket";
import { useEffect, useRef, useState } from "react";
import * as z from "zod";

type TextInputProps = {
  sendMessage: (e: React.SyntheticEvent) => void;
  setMessage: (message: string) => void;
  message: string;
};

function TextInput({ sendMessage, setMessage, message }: TextInputProps) {
  return (
    <form className="flex gap-4" id="chat-content" onSubmit={sendMessage}>
      <Input
        placeholder="Message..."
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type="text"
      />
      <Button type="submit">Send</Button>
    </form>
  );
}

const formSchema = z.string().min(1);

function MessageArea({
  roomId,
  messages: existingMessages,
}: {
  roomId: number;
  messages: Message[];
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(existingMessages);
  const messageGroups = groupMessagesByUser(messages);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const isScrolledToBottom = useScrollToBottom(contentRef, messages);
  const { payload } = useAuthContext();
  if (!payload) throw new Error("jwt payload is not defined");

  // メッセージを取得
  useEffect(() => {
    socket.connect();

    const handleMessage = (message: Message) => {
      setMessages((messages) => [...messages, message]);
    };

    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(message);
    if (result.success) {
      socket.emit("message", {
        userId: payload.userId,
        content: message,
        roomId,
      });
      setMessage("");
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      {/* Skeleton*/}
      <div className={`flex-grow ${isScrolledToBottom ? "hidden" : ""}`}>
        <Stack spacing={4}>
          <MessageSkeleton />
          <MessageSkeleton />
        </Stack>
      </div>
      {/* メッセージ表示エリア */}
      <div
        ref={contentRef}
        className={`overflow-auto flex-grow pb-4 ${
          isScrolledToBottom ? "" : "invisible"
        }`}
      >
        <Stack spacing={4}>
          {messageGroups.map((group, index) => (
            <MessageGroup messages={group} key={index} />
          ))}
        </Stack>
      </div>
      {/* メッセージ入力エリア */}
      <div>
        <TextInput
          setMessage={setMessage}
          message={message}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}

export default MessageArea;
