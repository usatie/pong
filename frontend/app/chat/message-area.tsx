import { Stack } from "@/app/ui/layout/stack";
import { useEffect, useRef, useState } from "react";
import { MessageGroup } from "./message-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { messages } from "./test-data";
import type { Message } from "./test-data";
import { MessageSkeleton } from "./skeleton";

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

function MessageArea() {
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
      <div className="flex gap-4">
        <Input placeholder="Type message here" />
        <Button>Send</Button>
      </div>
    </div>
  );
}

export default MessageArea;
