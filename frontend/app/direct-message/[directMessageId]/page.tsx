import ChatRoomCard from "@/app/ui/direct-message/chat-room";
import { getUserId } from "@/app/lib/session";
import {
  getUsers,
  getUser,
  getConversation,
  createConversation,
} from "@/app/lib/actions";
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
  let conversation =
    (await getConversation(String(currentUserId), String(otherUser.id))) ??
    (await getConversation(String(otherUser.id), String(currentUserId)));
  if (!conversation) {
    const res = await createConversation(
      String(currentUserId),
      String(otherUser.id),
    );
    conversation = await getConversation(
      String(currentUserId),
      String(otherUser.id),
    );
    if (!conversation) {
      throw new Error("getConversation error");
    }
  }
  console.log(conversation);
  return (
    <ChatRoomCard
      id={conversation.id}
      oldLog={conversation.directmessages}
      me={currentUser}
      other={otherUser}
    />
  );
}
