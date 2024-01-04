import { getRooms } from "@/app/lib/actions";
import { redirect } from "next/navigation";

export default async function RoomListPage() {
  const rooms = (await getRooms({ joined: true })) || [];
  if (rooms.length === 0) {
    return <div className="text-center">No rooms found.</div>;
  } else {
    redirect("/room/" + rooms[0].id);
  }
}
