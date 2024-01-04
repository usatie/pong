"use client";
import type { RoomEntity } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import { useRouter } from "next/navigation";

export default async function RoomsSidebar({
  selectedRoomId,
  rooms,
}: {
  selectedRoomId: number;
  rooms: RoomEntity[];
}) {
  const router = useRouter();
  return (
    <div className="overflow-y-auto shrink-0 basis-48 pb-4">
      <Stack space="space-y-0">
        {rooms.map((room) => (
          <button
            onClick={() => {
              router.push(`${room.id}`);
            }}
          >
            <div
              className={`p-2 rounded text-start hover:bg-secondary ${
                room.id === selectedRoomId ? "bg-secondary" : ""
              }`}
              key={room.id}
            >
              {room.name}
            </div>
          </button>
        ))}
      </Stack>
    </div>
  );
}
