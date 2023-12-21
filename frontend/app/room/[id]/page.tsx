import { getMessages, getRoom } from "@/app/lib/actions";
import { Separator } from "@/components/ui/separator";
import MessageArea from "./message-area";
import { Sidebar } from "./sidebar";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const roomId = Number(id);
  const room = await getRoom(roomId);
  const messages = await getMessages(roomId);
  console.log(room, messages);
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar roomId={roomId} users={room.users} />
        <Separator orientation="vertical" />
        <MessageArea roomId={roomId} messages={messages} />
      </div>
    </>
  );
}
