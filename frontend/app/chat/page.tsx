"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { HStack, Stack } from "@/app/ui/layout/stack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { users, messages } from "./test-data";
import type { Message, User } from "./test-data";

function AvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-10 w-10" />;
}

function SmallAvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-6 w-6" />;
}

function MessageSkeleton() {
  return (
    <div className="flex gap-4">
      <AvatarSkeleton />
      <div className="flex-grow flex flex-col justify-between">
        <Skeleton className="max-w-md h-1/3" />
        <Skeleton className="max-w-lg h-1/2" />
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
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

function SimpleMessage({ message }: { message: Message }) {
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
      {<ChatMessage message={messages[0]} />}
      {messages.slice(1).map((msg) => (
        <SimpleMessage message={msg} key={msg.id} />
      ))}
    </Stack>
  );
}

function Sidebar({ users }: { users: User[] }) {
  return (
    <div className="shrink-0 basis-36">
      <div className="overflow-auto flex-grow pb-4">
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
    </div>
  );
}

export default function ChatPage() {
  let prev_user_id: number | undefined;
  let block: Message[] = [];
  let blocks: Message[][] = [];
  for (const msg of messages) {
    if (prev_user_id === msg.user_id) {
      block.push(msg);
    } else {
      if (block.length > 0) {
        blocks.push(block);
      }
      block = [msg];
    }
    prev_user_id = msg.user_id;
  }
  if (block.length > 0) {
    blocks.push(block);
  }
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
