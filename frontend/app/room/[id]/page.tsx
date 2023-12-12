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

import { getUserId } from "@/app/lib/session";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "../sidebar";
import { getRoom, getUsers, getUser } from "@/app/lib/actions";
import MessageArea from "../message-area";
import { notFound } from "next/navigation";
import type { User } from "@/app/ui/user/card";
import type { UserOnRoom, UserWithRole } from "../sidebar";

type UserRole = {
  id: number;
  role: string;
};

export default async function Page({
  params: { id },
}: {
  params: { id: number };
}) {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("getUserId error");
    throw new Error("getUserId error");
  }
  const roomInfo = await getRoom(id);
  if (!roomInfo) {
    notFound();
  }
  const userOnRoom = roomInfo.users.map((user: UserOnRoom) => user.userId);
  console.log("userOnRoom", userOnRoom);
  const usersRole = roomInfo.users
    .map((user: UserOnRoom) => ({ id: user.userId, role: user.role }))
    .sort((a: UserRole, b: UserRole) => a.id - b.id);

  const myInfo = roomInfo.users.find((user: UserOnRoom) => {
    return user.userId === parseInt(currentUserId);
  });
  if (!myInfo) {
    console.error("Not participating in room");
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
  const currentUser = await getUser(parseInt(currentUserId));
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar roomId={id} myInfo={myInfo} users={participateWithRole} />
        <Separator orientation="vertical" />
        <MessageArea roomId={id} me={currentUser} />
      </div>
    </>
  );
}
