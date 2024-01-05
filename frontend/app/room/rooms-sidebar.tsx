"use client";
import type { RoomEntity } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter } from "next/navigation";

function RoomSidebarTitle() {
  const onClick = () => {
    console.log("create room");
  };
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex justify-between">
        <div className={`font-bold`}>Chats</div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="px-2" onClick={onClick}>
              +
            </button>
          </TooltipTrigger>
          <TooltipContent>Create Room</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function RoomButton({
  room,
  selected,
}: {
  room: RoomEntity;
  selected: boolean;
}) {
  const router = useRouter();
  const onClick = () => {
    router.push(`${room.id}`);
  };
  return (
    <button
      key={room.id}
      onClick={onClick}
      className={`p-2 rounded text-start hover:bg-secondary ${
        selected ? "bg-secondary" : ""
      }`}
    >
      {room.name}
    </button>
  );
}

export default function RoomsSidebar({ rooms }: { rooms: RoomEntity[] }) {
  const pathname = usePathname();
  let selectedRoomId: number | undefined;
  if (pathname.startsWith("/room/")) {
    selectedRoomId = parseInt(pathname.split("/")[2]);
  }
  return (
    <div className="overflow-y-auto shrink-0 basis-48 pb-4">
      <RoomSidebarTitle />
      <Stack space="space-y-0">
        {rooms.map((room) => (
          <RoomButton room={room} selected={room.id === selectedRoomId} />
        ))}
      </Stack>
    </div>
  );
}
