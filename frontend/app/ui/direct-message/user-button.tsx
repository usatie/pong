"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/app/ui/user/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { chatSocket as socket } from "@/socket";

export const UserButton = ({ user }: { user: User }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();

  const handleOnClick = () => {
    router.push(`/direct-message/${user.id}`);
  };

  const blockUser = () => {
    socket.emit("block", user.name! + user.id!);
    setIsBlocked(true);
  };

  const unblockUser = () => {
    socket.emit("unblock", user.name! + user.id!);
    setIsBlocked(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          onClick={handleOnClick}
          className="hover:text-black dark:hover:text-white text-slate-500 text-muted-foreground"
        >
          {user.name}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem inset>Go profile</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset disabled={isBlocked}>
          <button onClick={blockUser}>Block</button>
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!isBlocked}>
          <button onClick={unblockUser}>Unblock</button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
