import { getMessages, getRoom, getUsers } from "@/app/lib/actions";
import { Separator } from "@/components/ui/separator";
import MessageArea from "./message-area";
import UsersSidebar from "./users-sidebar";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const roomId = Number(id);
  const room = await getRoom(roomId);
  const messages = await getMessages(roomId);
  const allUsers = await getUsers();
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <UsersSidebar
          roomId={roomId}
          roomName={room.name}
          accessLevel={room.accessLevel}
          users={room.users}
          allUsers={allUsers}
        />
        <Separator orientation="vertical" />
        <MessageArea roomId={roomId} messages={messages} />
      </div>
    </>
  );
}
