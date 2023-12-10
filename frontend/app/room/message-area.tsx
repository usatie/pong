"use client";
import { Stack } from "@/app/ui/layout/stack";
import { useEffect, useRef, useState } from "react";
import { MessageGroup } from "@/app/chat/message-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/app/ui/user/card";
import { MessageSkeleton } from "@/app/chat/skeleton";
import { groupMessagesByUser, useScrollToBottom } from "@/app/chat/helper";
import { chatSocket as socket } from "@/socket";
import { getConversation } from "@/app/lib/actions";
import * as z from "zod";

//async function getMessages(otherId: number) {
//  console.log("conversation: ");
//  let conversation = await getConversation(otherId);
//  console.log("conversation: ", conversation);
//  return conversation;
//}

type Message = {
  userName: string;
  senderId: number;
  receiverId: number;
  content: string;
  roomId: number;
};

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

function MessageArea({ roomId, me }: { roomId: number; me: User }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageGroups = groupMessagesByUser(messages);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const isScrolledToBottom = useScrollToBottom(contentRef, messages);
  //  const myId = me.id.toString();

  // TODO: Messageを取得するsocketのロジック等を実装
  // メッセージを取得
  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", { roomId, userId: me.id });
    console.log("emit joinRoom");

    const handleMessageReceived = (newMessage: Message) => {
      console.log("received message: ", newMessage);
      setMessages((oldMessages) => [...oldMessages, newMessage]);
      console.log(newMessage);
    };

    socket.on("sendToClient", handleMessageReceived);
    return () => {
      console.log(`return from useEffect`);
      socket.off("sendToClient", handleMessageReceived);
      socket.emit("leaveRoom", roomId);
      console.log("disconnect");
      socket.disconnect();
    };
  }, [roomId, me.id]);

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
      socket.emit("newMessage", {
        userName: me.name,
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
