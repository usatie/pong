import { Separator } from "@/components/ui/separator";
import { testData } from "./test-data";
import { Sidebar } from "./sidebar";
import MessageArea from "./message-area";

async function getUsers() {
  return testData.users;
}

export default async function ChatPage() {
  const users = await getUsers();
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar users={users} />
        <Separator orientation="vertical" />
        <MessageArea />
      </div>
    </>
  );
}
