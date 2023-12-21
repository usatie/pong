"use client";
import { Stack } from "@/app/ui/layout/stack";
import { groupMessagesByUser, useScrollToBottom } from "@/app/ui/room/helper";
import { MessageGroup } from "@/app/ui/room/message-group";
import { MessageSkeleton } from "@/app/ui/room/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatSocket as socket } from "@/socket";
import { useEffect, useRef, useState } from "react";
import * as z from "zod";
import { useAuthContext } from "../lib/client-auth";
import { Message } from "../ui/room/test-data";

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
  const { currentUser } = useAuthContext();
  //  const myId = me.id.toString();

  // TODO: Messageを取得するsocketのロジック等を実装
  // メッセージを取得
  useEffect(() => {
    socket.connect();

    const handleMessage = (message: Message) => {
      console.log("received message: ", message);
      setMessages((oldMessages) => [...oldMessages, message]);
      console.log(message);
    };

    socket.on("message", handleMessage);
    return () => {
      console.log(`return from useEffect`);
      socket.off("message", handleMessage);
      console.log("disconnect");
      socket.disconnect();
    };
  }, [roomId]);

  //  const didLogRef = useRef(false);
  //  useEffect(() => {
  //    if (didLogRef.current === false) {
  //      didLogRef.current = true;
  //      const fetchMessages = async () => {
  //      const conversation = await getMessages(otherId);
  //      const messages = conversation;
  //      setMessages(messages);
  //      };
  //      fetchMessages();
  //    }
  //  }, []);

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("sendMessage");
    const result = formSchema.safeParse(message);
    if (result.success) {
      socket.emit("message", {
        userId: currentUser?.id,
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
