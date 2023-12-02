import ChatRoomCard from "@/app/ui/direct-message/chat-room";
import { getUserId } from "@/app/lib/session";
import { getUsers, getUser } from "@/app/lib/actions";
import type { User } from "@/app/ui/user/card";
import { notFound } from "next/navigation";

export default async function Page({
  params: { directMessageId },
}: {
  params: { directMessageId: string };
}) {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("getUserId error");
    throw new Error("getUserId error");
  }
  const currentUser = await getUser(parseInt(currentUserId));
  if (!currentUser) {
    console.error("getUser error");
    throw new Error("getUser error");
  }
  const otherUsers = await getUsers();
  const otherUser = otherUsers.find(
    (user) => user.id === parseInt(directMessageId),
  );
  if (!otherUser || otherUser.id === parseInt(currentUserId)) {
    notFound();
  }
  return <ChatRoomCard me={currentUser} other={otherUser} />;
}
