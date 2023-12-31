import type { MessageEvent } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import { MessageItem } from "./message-item";

export function MessageGroup({ messages }: { messages: MessageEvent[] }) {
  return (
    <Stack space="space-y-1">
      {messages.map((msg, i) => {
        return <MessageItem message={msg} withAvatar={i === 0} key={i} />;
      })}
    </Stack>
  );
}
