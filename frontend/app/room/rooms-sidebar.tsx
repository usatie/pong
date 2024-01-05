"use client";
import type { RoomEntity } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import { usePathname, useRouter } from "next/navigation";

export default function RoomsSidebar({ rooms }: { rooms: RoomEntity[] }) {
  const router = useRouter();
  const pathname = usePathname();
  let selectedRoomId: number | undefined;
  if (pathname.startsWith("/room/")) {
    selectedRoomId = parseInt(pathname.split("/")[2]);
  }
  return (
    <div className="overflow-y-auto shrink-0 basis-48 pb-4">
      <Stack space="space-y-0">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => {
              router.push(`${room.id}`);
            }}
          >
            <div
              className={`p-2 rounded text-start hover:bg-secondary ${
                room.id === selectedRoomId ? "bg-secondary" : ""
              }`}
            >
              {room.name}
            </div>
          </button>
        ))}
      </Stack>
    </div>
  );
}
