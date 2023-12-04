"use client";

import { Stack } from "@/app/ui/layout/stack";
import { SmallAvatarSkeleton } from "./skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { User } from "@/app/ui/user/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { chatSocket as socket } from "@/socket";

function truncateString(str: string | undefined, num: number): string {
  if (!str) {
    return "";
  }
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export function Sidebar({ users }: { users: User[] }) {
  // TODO: If users is empty, show a message like "No users found"
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);

  const handleOnClick = (user: User) => {
    router.push(`/chat/${user.id}`);
  };

  const blockUser = (user: User) => {
    socket.emit("block", user.id);
    setIsBlocked(true);
  };

  const unblockUser = (user: User) => {
    socket.emit("unblock", user.id);
    setIsBlocked(false);
  };

  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4">
      <Stack spacing={2}>
        {users.map((user) => (
          <ContextMenu key={user.id}>
            <ContextMenuTrigger>
              <button
                onClick={() => handleOnClick(user)}
                className="flex gap-2 items-center group hover:opacity-60"
              >
                <SmallAvatarSkeleton />
                <span className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
                  {truncateString(user.name, 15)}
                </span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56">
              <ContextMenuItem inset>Go profile</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem inset disabled={isBlocked}>
                <button onClick={() => blockUser(user)}>Block</button>
              </ContextMenuItem>
              <ContextMenuItem inset disabled={!isBlocked}>
                <button onClick={() => unblockUser(user)}>Unblock</button>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </Stack>
    </div>
  );
}
