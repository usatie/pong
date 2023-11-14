import RoomCard, { Room } from "@/components/room-card";

async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${process.env.API_URL}/room`, {
    cache: "no-cache",
  });
  const rooms = await res.json();
  return rooms;
}

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
