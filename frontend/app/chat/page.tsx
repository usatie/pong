"use client";
import { HStack, Stack } from "@/app/ui/layout/stack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { users, messages } from "./test-data";
import type { Message, User } from "./test-data";
import {
  AvatarSkeleton,
  SmallAvatarSkeleton,
  MessageSkeleton,
} from "./skeleton";

function MessageItem({
  message,
  withAvatar,
}: {
  message: Message;
  withAvatar: boolean;
}) {
  const created_at_hhmm = message.created_at.split(" ")[1].slice(0, 5);

  return (
    <HStack spacing={4} className="group hover:opacity-60">
      {withAvatar && (
        <>
          {/* Left Side */}
          <AvatarSkeleton />
          {/* Right Side */}
          <Stack>
            <HStack spacing={2}>
              <div className="text-xs">{message.user_name}</div>
              <div className="text-xs text-muted-foreground">
                {message.created_at}
              </div>
            </HStack>
            <div className="text-sm text-muted-foreground">{message.text}</div>
          </Stack>
        </>
      )}
      {!withAvatar && (
        <>
          {/* Left Side */}
          <div className="group-hover:text-muted-foreground flex-none text-background text-xs w-10 text-center">
            {created_at_hhmm}
          </div>
          {/* Right Side */}
          <div className="text-sm text-muted-foreground">{message.text}</div>
        </>
      )}
    </HStack>
  );
}

function MessageGroup({ messages }: { messages: Message[] }) {
  return (
    <Stack spacing={1}>
      {messages.map((msg, i) => {
        return <MessageItem message={msg} withAvatar={i === 0} key={msg.id} />;
      })}
    </Stack>
  );
}

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

function Sidebar({ users }: { users: User[] }) {
  return (
    <div className="overflow-y-auto shrink-0 basis-36 flex-grow pb-4">
      <Stack spacing={2}>
        {users.map((user) => (
          <button
            key={user.id}
            className="flex gap-2 items-center group hover:opacity-60"
          >
            <SmallAvatarSkeleton />
            <a className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
              {truncateString(user.name, 15)}
            </a>
          </button>
        ))}
      </Stack>
    </div>
  );
}

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
