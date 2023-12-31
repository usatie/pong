"use client";

import { leaveRoom } from "@/app/lib/actions";
import { PublicUserEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import { useModal } from "@/app/lib/hooks/use-modal-store";
import { BanModal } from "@/app/ui/room/ban-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ban, ChevronDown, LogOut, Settings, UserPlus } from "lucide-react";

export const SidebarMenu = ({
  roomId,
  roomName,
  me,
  allUsers,
  bannedUsers,
}: {
  roomId: number;
  roomName: string;
  me: UserOnRoomEntity;
  allUsers: PublicUserEntity[];
  bannedUsers: PublicUserEntity[];
}) => {
  const { onOpen } = useModal();

  const handleLeave = () => {
    leaveRoom(roomId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button className="w-full text-md font-semibold px-3 flex items-center h-10 border-meutral-200 dark:border-neutral-800 border-b-2 mb-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
          {roomName}
          <ChevronDown className="h-5 w-5 ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
        <DropdownMenuItem className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer">
          Add User
          <UserPlus className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        {(me.role === "OWNER" || me.role === "ADMINISTRATOR") && (
          <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer">
            Setting
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {(me.role === "OWNER" || me.role === "ADMINISTRATOR") && (
          <DropdownMenuItem
            onClick={() =>
              onOpen("ban", { roomId, roomName, me, allUsers, bannedUsers })
            }
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
          >
            Ban User
            <Ban className="h-4 w-4 ml-auto" />
            <BanModal />
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleLeave}
          className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
        >
          Leave
          <LogOut className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
