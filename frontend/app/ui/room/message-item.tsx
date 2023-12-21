import { HStack, Stack } from "@/app/ui/layout/stack";
import { Avatar } from "./skeleton";
import type { Message } from "./types";

export function MessageItem({
  message,
  withAvatar,
}: {
  message: Message;
  withAvatar: boolean;
}) {
  //  const created_at_hhmm = message.created_at.split(" ")[1].slice(0, 5);

  return (
    <HStack spacing={4} className="group hover:opacity-60">
      {/* Left Side */}
      {withAvatar && <Avatar avatarURL={message.user.avatarURL} />}
      {!withAvatar && (
        <div className="group-hover:text-muted-foreground flex-none text-background text-xs w-10 text-center">
          {/* <span>{created_at_hhmm}</span> */}
        </div>
      )}
      {/* Right Side */}
      <Stack>
        {withAvatar && (
          <HStack spacing={2}>
            <div className="text-xs">{message.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {/* message.created_at */}
            </div>
          </HStack>
        )}
        <div className="text-sm text-muted-foreground">{message.content}</div>
      </Stack>
    </HStack>
  );
}
