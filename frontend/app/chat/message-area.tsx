"use client";
import { Stack } from "@/app/ui/layout/stack";
import { useEffect, useRef, useState } from "react";
import { MessageGroup } from "./message-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { testData } from "./test-data";
import type { Message } from "./test-data";
import type { User } from "@/app/ui/user/card";
import { MessageSkeleton } from "./skeleton";
import { groupMessagesByUser, useScrollToBottom } from "./helper";
import { chatSocket as socket } from "@/socket";
import { getConversation } from "@/app/lib/actions";
import * as z from "zod";

async function getMessages(otherId: number) {
  console.log("conversation: ");
  // TODO: Implement this function
  let conversation = await getConversation(otherId);
  if (!conversation) {
    conversation = [];
  }
  console.log("conversation: ", conversation);
  return conversation;
}

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

function MessageArea({ me, other }: { me: User; other: User }) {
  const [message, setMessage] = useState("");
  const [id, setId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageGroups = groupMessagesByUser(messages);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const isScrolledToBottom = useScrollToBottom(contentRef, messages);
  const myId = me.id.toString();
  const otherId = other.id;

  // TODO: Messageを取得するsocketのロジック等を実装
  // メッセージを取得
  useEffect(() => {
    socket.connect();
    socket.emit("joinDM", myId);

    const handleMessageReceived = (newMessage: Message) => {
      if (newMessage.from === otherId.toString() || newMessage.from === myId) {
        console.log("received message: ", newMessage);
        setMessages((oldMessages) => [...oldMessages, newMessage]);
        console.log(newMessage);
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

  const didLogRef = useRef(false);
  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true;
      const fetchMessages = async () => {
        const conversation = await getMessages(otherId);
        const messages = conversation;
        setMessages(messages);
      };
      fetchMessages();
    }
  }, [myId, otherId]);

  const sendMessage = (e: React.SyntheticEvent) => {
    // TODO: Implement this function
    e.preventDefault();
    console.log("sendMessage");
    const result = formSchema.safeParse(message);
    if (result.success) {
      socket.emit("privateMessage", {
        receiverId: other.id,
        content: message,
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
