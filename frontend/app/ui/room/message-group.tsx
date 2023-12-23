import type { Message } from "@/app/lib/types";
import { Stack } from "@/components/layout/stack";
import { MessageItem } from "./message-item";

export function MessageGroup({ messages }: { messages: Message[] }) {
  return (
    <Stack space="space-y-1">
      {messages.map((msg, i) => {
        return <MessageItem message={msg} withAvatar={i === 0} key={i} />;
      })}
    </Stack>
  );
}
