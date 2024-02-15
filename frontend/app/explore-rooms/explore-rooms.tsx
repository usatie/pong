"use client";

import RoomCard from "./room-card";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DeleteRoomEvent, RoomEntity } from "@/app/lib/dtos";
import { chatSocket as socket } from "@/socket";

export function ExploreRooms({ rooms }: { rooms: RoomEntity[] }) {
  const router = useRouter();
  const handleDeleteRoomEvent = useCallback(
    (data: DeleteRoomEvent) => {
      router.refresh();
    },
    [router],
  );
  useEffect(() => {
    socket.on("delete-room", handleDeleteRoomEvent);
    return () => {
      socket.off("delete-room", handleDeleteRoomEvent);
    };
  }, [handleDeleteRoomEvent]);
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold">Explore Rooms</h1>
      <div className="flex flex-wrap gap-4">
        {rooms.map((room) => (
          <RoomCard room={room} key={room.id} />
        ))}
      </div>
    </div>
  );
}
