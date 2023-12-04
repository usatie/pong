import { Stack } from "@/app/ui/layout/stack";
import { MessageItem } from "./message-item";
import type { Message } from "./test-data";

export function MessageGroup({ messages }: { messages: Message[] }) {
  return (
    <Stack spacing={1}>
      {messages.map((msg, i) => {
        return <MessageItem message={msg} withAvatar={i === 0} key={msg.id} />;
      })}
    </Stack>
  );
}