import type { MessageEvent } from "@/app/lib/dtos";
import { Avatar } from "@/app/ui/user/avatar";
import { Stack } from "@/components/layout/stack";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export function MessageItem({
  message,
  withAvatar,
}: {
  message: MessageEvent;
  withAvatar: boolean;
}) {
  //  const created_at_hhmm = message.created_at.split(" ")[1].slice(0, 5);

  return (
    <div className="flex gap-4 group hover:opacity-60">
      {/* Left Side */}
      {withAvatar && (
        <TooltipProvider>
          <Avatar
            avatarURL={message.user.avatarURL}
            size="medium"
            href={`/user/${message.user.id}`}
            id={message.user.id}
          ></Avatar>
        </TooltipProvider>
      )}
      {!withAvatar && (
        <div className="group-hover:text-muted-foreground flex-none text-background text-xs w-10 text-center">
          {/* <span>{created_at_hhmm}</span> */}
        </div>
      )}
      {/* Right Side */}
      <Stack space="space-y-1">
        {withAvatar && (
          <div className="flex gap-2">
            <div className="text-xs">{message.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {/* message.created_at */}
            </div>
          </div>
        )}
        <div className="text-sm text-muted-foreground">{message.content}</div>
      </Stack>
    </div>
  );
}
