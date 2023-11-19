//import { getRoom } from "@/app/lib/actions";
//
//export default async function getRoomInfo({
//  params: { id },
//}: {
//  params: { id: number };
//}) {
//  const room = await getRoom(id);
//  return (
//    <div>
//      <h1>
//        <b>Room info</b>
//      </h1>
//      room ID: {room.id} <br />
//      room name: {room.name} <br />
//      {room.users.map((user: Array<any>) => {
//        return Object.entries(user).map(([key, value]) => {
//          return (
//            <div key={key}>
//              {key} : {value}
//            </div>
//          );
//        });
//      })}
//    </div>
//  );
//}

import ChatRoomCard from "@/app/ui/room/chat-room";
import { getUserId } from "@/app/lib/session";
import { getUser } from "@/app/lib/actions";

export default async function Page({
  params: { id },
}: {
  params: { id: number };
}) {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("error");
    return null;
  }
  const currentUser = await getUser(parseInt(currentUserId));
  return <ChatRoomCard id={id} user={currentUser} />;
}
