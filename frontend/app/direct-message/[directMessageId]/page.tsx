import ChatRoomCard from "@/app/ui/direct-message/chat-room";
import { getUserId } from "@/app/lib/session";
import { getUsers } from "@/app/lib/actions";
import { getUser } from "@/app/lib/actions";

export default async function Page({
  params: { directMessageId },
}: {
  params: { directMessageId: number };
}) {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("error");
    return null;
  }
  const currentUser = await getUser(parseInt(currentUserId));
  const otherUsers = await getUsers();
  const otherUser = otherUsers.find((user) => user.id === parseInt(directMessageId));
  console.log(typeof directMessageId);
  console.log(otherUser);
  return <ChatRoomCard yourself={currentUser} other={otherUser} />;
}
