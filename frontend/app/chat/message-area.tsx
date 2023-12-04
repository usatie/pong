"use client";
import { Stack } from "@/app/ui/layout/stack";
import { useEffect, useRef, useState } from "react";
import { MessageGroup } from "./message-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { testData } from "./test-data";
import type { Message } from "./test-data";
import { MessageSkeleton } from "./skeleton";
import { groupMessagesByUser, useScrollToBottom } from "./helper";

async function getMessages() {
  // TODO: Implement this function
  return testData.messages;
}

function MessageArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageGroups = groupMessagesByUser(messages);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const isScrolledToBottom = useScrollToBottom(contentRef, messages);

  // TODO: Messageを取得するsocketのロジック等を実装
  // メッセージを取得
  useEffect(() => {
    const fetchMessages = async () => {
      const messages = await getMessages();
      setMessages(messages);
    };
    fetchMessages();
  }, []);

  const sendMessage = (e: React.SyntheticEvent) => {
    // TODO: Implement this function
    e.preventDefault();
    console.log("sendMessage");
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
          {messageGroups.map((group) => (
            <MessageGroup messages={group} key={group[0].id} />
          ))}
        </Stack>
      </div>
      {/* メッセージ入力エリア */}
      <div className="flex gap-4">
        <Input placeholder="Type message here" />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}

export default MessageArea;
