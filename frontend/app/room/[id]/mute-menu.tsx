"use client";

import { muteUser, unmuteUser } from "@/app/lib/actions";
import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { useState } from "react";

export default function MuteMenu({
  isMuted,
  mutePending,
  roomId,
  userId,
  mute,
}: {
  isMuted: boolean;
  mutePending: boolean;
  roomId: number;
  userId: number;
  mute: (duration?: number) => void;
}) {
  return (
    <div>
      <ContextMenuSub>
        <ContextMenuSubTrigger>Mute</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-46">
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute(5 * 60);
            }}
          >
            For 5 minutes
          </ContextMenuItem>
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute(15 * 60);
            }}
          >
            For 15 minutes
          </ContextMenuItem>
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute(60 * 60);
            }}
          >
            For 1 Hour
          </ContextMenuItem>
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute(180 * 60);
            }}
          >
            For 3 Hours
          </ContextMenuItem>
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute(480 * 60);
            }}
          >
            For 8 Hours
          </ContextMenuItem>
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute(1440 * 60);
            }}
          >
            For 24 Hours
          </ContextMenuItem>
          <ContextMenuItem
            disabled={mutePending || isMuted}
            onSelect={() => {
              mute();
            }}
          >
            Indefinite
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </div>
  );
}
