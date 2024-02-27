"use client";
import { useAuthContext } from "@/app/lib/client-auth";
import type { EnterRoomEvent, RoomEntity } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import { chatSocket as socket } from "@/socket";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import CreateRoomDialog from "./create-room-dialog";

function RoomButton({
  room,
  meId,
  selected,
}: {
  room: RoomEntity;
  meId: number | undefined;
  selected: boolean;
}) {
  const router = useRouter();
  const onClick = () => {
    router.push(`${room.id}`);
    router.refresh();
  };
  let roomName = room.name;
  if (room.accessLevel === "DIRECT") {
    const otherUser = room.users?.find((user) => user.userId !== meId);
    if (otherUser) {
      roomName = otherUser.user.name;
    }
  }
  return (
    <button
      key={room.id}
      onClick={onClick}
      className={`p-2 rounded text-start hover:bg-secondary ${
        selected ? "bg-secondary" : ""
      }`}
    >
      {roomName}
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
  const { currentUser } = useAuthContext();
  const router = useRouter();
  let selectedRoomId: number | undefined;
  if (pathname.startsWith("/room/")) {
    selectedRoomId = parseInt(pathname.split("/")[2], 10);
  }

  const handleEnterRoomEvent = useCallback(
    (data: EnterRoomEvent) => {
      if (currentUser?.id === data.userId) {
        router.refresh();
      }
    },
    [currentUser, router],
  );
  useEffect(() => {
    socket.on("enter-room", handleEnterRoomEvent);
    return () => {
      socket.off("enter-room", handleEnterRoomEvent);
    };
  }, [handleEnterRoomEvent]);

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
            meId={currentUser?.id}
            selected={room.id === selectedRoomId}
            key={room.id}
          />
        ))}
        <ExploreButton />
      </Stack>
    </div>
  );
}
