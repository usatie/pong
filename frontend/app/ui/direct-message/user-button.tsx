"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { User } from "@/app/ui/user/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const UserButton = ({ user }: { user: User }) => {
  const router = useRouter();

  const handleOnClick = () => {
    router.push(`/direct-message/${user.id}`);
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
        <ContextMenuItem inset>Block</ContextMenuItem>
        <ContextMenuItem inset disabled>
          Unblock
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
