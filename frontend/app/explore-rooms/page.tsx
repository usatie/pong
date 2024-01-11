import { getRooms } from "@/app/lib/actions";
import RoomCard from "./room-card";

export default async function ExploreRoomsPage() {
  const rooms = await getRooms({ joined: false });
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
