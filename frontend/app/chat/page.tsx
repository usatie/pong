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

function MessageWithAvatar({ message }: { message: Message }) {
  return (
    <HStack spacing={4} className="hover:opacity-60">
      <AvatarSkeleton />
      <Stack>
        <HStack spacing={2}>
          <div className="text-xs">{message.user_name}</div>
          <div className="text-xs text-muted-foreground">
            {message.created_at}
          </div>
        </HStack>
        <div className="text-sm text-muted-foreground">{message.text}</div>
      </Stack>
    </HStack>
  );
}

function MessageWithoutAvatar({ message }: { message: Message }) {
  const created_at_hhmm = message.created_at.split(" ")[1].slice(0, 5);
  return (
    <HStack spacing={4} className="group hover:opacity-60 mt-0">
      <div className="group-hover:text-muted-foreground flex-none text-background text-xs w-10 text-center">
        {created_at_hhmm}
      </div>
      <div className="text-sm text-muted-foreground">{message.text}</div>
    </HStack>
  );
}

function MessageBlock({ messages }: { messages: Message[] }) {
  return (
    <Stack spacing={1}>
      {<MessageWithAvatar message={messages[0]} />}
      {messages.slice(1).map((msg) => (
        <MessageWithoutAvatar message={msg} key={msg.id} />
      ))}
    </Stack>
  );
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
              {/* if name is long, trim and append "..." */}
              {user.name.length > 15
                ? user.name.slice(0, 15) + "..."
                : user.name}
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
  const blocks = groupMessagesByUser(messages);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
      setIsScrolledToBottom(true);
    }
  }, []);
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
              {blocks.map((block) => (
                <MessageBlock messages={block} key={block[0].id} />
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
