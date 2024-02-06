"use client";
import type { RoomEntity } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CreateRoomDialog from "./create-room-dialog";

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
    router.refresh();
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

function ExploreButton() {
  return (
    <div
      className={`p-2 rounded text-start font-bold text-primary hover:bg-primary hover:text-primary-foreground`}
    >
      <Link href={`/explore-rooms`}>Explore Rooms</Link>
    </div>
  );
}

export default function RoomsSidebar({ rooms }: { rooms: RoomEntity[] }) {
  const pathname = usePathname();
  let selectedRoomId: number | undefined;
  if (pathname.startsWith("/room/")) {
    selectedRoomId = parseInt(pathname.split("/")[2], 10);
  }
  return (
    <div className="overflow-y-auto shrink-0 basis-48 pb-4">
      <div className="flex justify-between">
        <div className={`font-bold`}>Chats</div>
        <CreateRoomDialog />
      </div>
      <Stack space="space-y-0">
        {rooms.map((room) => (
          <RoomButton
            room={room}
            selected={room.id === selectedRoomId}
            key={room.id}
          />
        ))}
        <ExploreButton />
      </Stack>
    </div>
  );
}
