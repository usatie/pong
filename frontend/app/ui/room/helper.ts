import { useEffect, useState } from "react";
import type { Message } from "./types";

export function groupMessagesByUser(messages: Message[]): Message[][] {
  let prevUserId: number | undefined = undefined;
  const groupedMessages: Message[][] = [];
  let currentGroup: Message[] = [];

  for (const msg of messages) {
    if (msg.user.id === prevUserId) {
      currentGroup.push(msg);
    } else {
      if (currentGroup.length) {
        groupedMessages.push(currentGroup);
      }
      currentGroup = [msg];
    }
    prevUserId = msg.user.id;
  }

  if (currentGroup.length) {
    groupedMessages.push(currentGroup);
  }

  return groupedMessages;
}

export function useScrollToBottom(
  ref: React.RefObject<HTMLDivElement>,
  messages: Message[],
) {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  // コンポーネントがマウントされた時に実行
  useEffect(() => {
    console.log("useScrollToBottom: mounted");
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
      setIsScrolledToBottom(true);
    }
  }, [ref]); // 空の依存配列で初回マウント時のみ実行

  // メッセージが更新された時に実行
  useEffect(() => {
    console.log("useScrollToBottom: messages updated");
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages, ref]);

  return isScrolledToBottom;
}
