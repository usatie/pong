import ChatRoomCard from "@/app/ui/direct-message/chat-room";
import { getUserId } from "@/app/lib/session";
import { getUsers } from "@/app/lib/actions";
import { getUser } from "@/app/lib/actions";
import type { User } from "@/app/ui/user/card";

export default async function Page({
  params: { directMessageId },
}: {
  params: { directMessageId: string };
}) {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("error");
    return null;
  }
  const currentUser = await getUser(parseInt(currentUserId));
  if (!currentUser) {
    console.error("error");
    return null;
  }
  const otherUsers = await getUsers();
  const otherUser = otherUsers.find(
    (user) => user.id === parseInt(directMessageId),
  );
  if (!otherUser) {
    console.error("error");
    return null;
  }
  return <ChatRoomCard yourself={currentUser} other={otherUser} />;
}
