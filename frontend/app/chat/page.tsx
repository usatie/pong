"use client";
import { Stack } from "@/app/ui/layout/stack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { users, messages } from "./test-data";
import type { Message } from "./test-data";
import { MessageSkeleton } from "./skeleton";
import { Sidebar } from "./sidebar";
import { MessageGroup } from "./message-group";

function groupMessagesByUser(messages: Message[]): Message[][] {
  let prevUserId: number | undefined = undefined;
  const groupedMessages: Message[][] = [];
  let currentGroup: Message[] = [];

  for (const msg of messages) {
    if (msg.user_id === prevUserId) {
      currentGroup.push(msg);
    } else {
      if (currentGroup.length) {
        groupedMessages.push(currentGroup);
      }
      currentGroup = [msg];
    }
    prevUserId = msg.user_id;
  }

  if (currentGroup.length) {
    groupedMessages.push(currentGroup);
  }

  return groupedMessages;
}

export default function ChatPage() {
  const messageGroups = groupMessagesByUser(messages);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  // コンポーネントがマウントされた時に実行
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
      setIsScrolledToBottom(true);
    }
  }, []); // 空の依存配列で初回マウント時のみ実行

  // メッセージが更新された時に実行
  useEffect(() => {
    if (contentRef.current) {
      const isScrolledToBottom =
        contentRef.current.scrollHeight - contentRef.current.scrollTop ===
        contentRef.current.clientHeight;

      if (isScrolledToBottom) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
        setIsScrolledToBottom(true);
      }
    }
  }, [messages]);

  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        {/* Side bar */}
        <Sidebar users={users} />
        <Separator orientation="vertical" />
        {/* Chat */}
        <div className="flex-grow flex flex-col">
          {/* Skeleton*/}
          <div className={`flex-grow ${isScrolledToBottom ? "hidden" : ""}`}>
            <Stack spacing={4}>
              <MessageSkeleton />
              <MessageSkeleton />
            </Stack>
          </div>
          {/* Messages */}
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
          {/* Text Input */}
          <div className="flex gap-4">
            <Input placeholder="Type message here" />
            <Button>Send</Button>
          </div>
        </div>
      </div>
    </>
  );
}
