import { getMessages, getRoom, getUsers } from "@/app/lib/actions";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import MessageArea from "./message-area";
import RoomDetail from "./room-detail";
import { getCurrentUserId } from "@/app/lib/session";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const roomId = Number(id);
  let room;
  try {
    room = await getRoom(roomId);
  } catch (e) {
    notFound();
  }
  const messages = await getMessages(roomId);
  const allUsers = await getUsers();
  const currentUserId = await getCurrentUserId();
  const me = room.users.find((u) => u.userId === currentUserId);
  if (!me) {
    notFound();
  }
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <MessageArea roomId={roomId} messages={messages} />
        <Separator orientation="vertical" />
        <RoomDetail
          room={room}
          users={room.users}
          allUsers={allUsers}
          me={me}
        />
      </div>
    </>
  );
}
