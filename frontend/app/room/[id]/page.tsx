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

import { getCurrentUserId } from "@/app/lib/session";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "../sidebar";
import { getRoom, getUsers, getUser } from "@/app/lib/actions";
import MessageArea from "../message-area";
import { notFound } from "next/navigation";
import type { User } from "@/app/ui/user/card";
import type { UserOnRoom, UserWithRole } from "../sidebar";
import { getMessages } from "@/app/lib/actions";

type UserRole = {
  id: number;
  role: string;
};

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const roomId = Number(id);
  const currentUserId = await getCurrentUserId();
  const roomInfo = await getRoom(roomId);
  if (!roomInfo) {
    notFound();
  }
  const userOnRoom = roomInfo.users.map((user: UserOnRoom) => user.userId);
  console.log("userOnRoom", userOnRoom);
  const usersRole = roomInfo.users
    .map((user: UserOnRoom) => ({ id: user.userId, role: user.role }))
    .sort((a: UserRole, b: UserRole) => a.id - b.id);

  const myInfo = roomInfo.users.find((user: UserOnRoom) => {
    return user.userId === currentUserId;
  });
  if (!myInfo) {
    throw new Error("Not participating in room");
  }
  const allUsers = await getUsers();
  const participate = allUsers.filter((user) => {
    return userOnRoom.includes(user.id);
  });
  const participateWithRole: UserWithRole<User>[] = participate.map(
    (user, i) => ({
      ...user,
      role: usersRole[i].role,
    }),
  );
  const currentUser = await getUser(currentUserId);
  const messages = await getMessages(roomId);
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar roomId={roomId} myInfo={myInfo} users={participateWithRole} />
        <Separator orientation="vertical" />
        <MessageArea roomId={roomId} me={currentUser} messages={messages} />
      </div>
    </>
  );
}
