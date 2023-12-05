import { Separator } from "@/components/ui/separator";
import { testData } from "../test-data";
import { Sidebar } from "../sidebar";
import MessageArea from "../message-area";
import { getUserId } from "@/app/lib/session";
import { getUser, getUsers } from "@/app/lib/actions";

//async function getUsers() {
//  return testData.users;
//}

export default async function ChatPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [tmpUsers, currentUserId] = await Promise.all([
    getUsers(),
    getUserId(),
  ]);
  if (!currentUserId) {
    throw new Error("getUserId error");
  }
  const currentUser = await getUser(parseInt(currentUserId));
  const users = tmpUsers.filter((user) => user.id !== parseInt(currentUserId));
  if (users.length === 0) {
    console.error("No other users exist");
    throw new Error("No other users exist");
  }
  const otherUser = users.find((user) => String(user.id) === id);
  if (!otherUser) {
    console.error("Can't find the other user");
    throw new Error("Can't find the other user");
  }
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar users={users} />
        <Separator orientation="vertical" />
        <MessageArea me={currentUser} other={otherUser} />
      </div>
    </>
  );
}
