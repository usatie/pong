import RoomCard from "@/app/ui/room/card";
import type { Room } from "@/app/ui/room/card";
import { getRooms } from "@/app/lib/actions";

export default async function RoomListPage() {
  const rooms = await getRooms();
  return (
    <div className="flex flex-wrap gap-8">
      {rooms.map((room, index) => (
        <RoomCard room={room} key={index} />
      ))}
    </div>
  );
}
