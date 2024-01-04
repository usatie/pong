import { getRooms } from "@/app/lib/actions";
import { Separator } from "@/components/ui/separator";
import RoomsSidebar from "./rooms-sidebar";

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  const rooms = (await getRooms({ joined: true })) || [];
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <RoomsSidebar rooms={rooms} />
        <Separator orientation="vertical" />
        {children}
      </div>
    </>
  );
}
