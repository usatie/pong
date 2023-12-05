import { Separator } from "@/components/ui/separator";
//import { testData } from "./test-data";
import { Sidebar } from "./sidebar";
import MessageArea from "./message-area";
import { getUserId } from "@/app/lib/session";
import { getUsers } from "@/app/lib/actions";

//async function getUsers() {
//  return testData.users;
//}

export default async function ChatPage() {
  const [tmpUsers, currentUserId] = await Promise.all([
    getUsers(),
    getUserId(),
  ]);
  if (!currentUserId) {
    throw new Error("getUserId error");
  }
  const users = tmpUsers.filter((user) => user.id !== parseInt(currentUserId));
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar users={users} />
        <Separator orientation="vertical" />
      </div>
    </>
  );
}
