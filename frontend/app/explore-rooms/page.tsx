import { getRooms } from "@/app/lib/actions";
import { ExploreRooms } from "./explore-rooms";

export default async function ExploreRoomsPage() {
  const rooms = await getRooms({ joined: false });
  return (
    <>
      <ExploreRooms rooms={rooms} />
    </>
  );
}
