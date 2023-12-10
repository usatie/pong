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
import { getRoom, getUser, getUsers } from "@/app/lib/actions";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/app/chat/sidebar";
import MessageArea from "../message-area";
import type { User } from "@/app/ui/user/card";

type UserOnRoom = {
  id: number;
  userId: number;
  role: string;
  roomId: number;
};

export default async function Page({
  params: { id },
}: {
  params: { id: number };
}) {
  const roomInfo = await getRoom(id);
  if (!roomInfo) {
    notFound();
  }
  const userOnRoom = roomInfo.users.map((user: UserOnRoom) => user.userId);
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("getUserId error");
    throw new Error("getUserId error");
  }
  const allUsers = await getUsers();
  const participate = allUsers.filter((user) => {
    return userOnRoom.includes(user.id);
  });
  const currentUser = await getUser(parseInt(currentUserId));
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar users={participate} />
        <Separator orientation="vertical" />
        <MessageArea roomId={id} me={currentUser} />
      </div>
    </>
  );
}
