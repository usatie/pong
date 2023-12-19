import { Separator } from "@/components/ui/separator";
import { Sidebar } from "./sidebar";
import { getUsers } from "@/app/lib/actions";
import { getCurrentUserId } from "@/app/lib/session";

export default async function ChatPage() {
  const [allUsers, currentUserId] = await Promise.all([
    getUsers(),
    getCurrentUserId(),
  ]);
  const users = allUsers.filter((user) => user.id !== currentUserId);
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar users={users} />
        <Separator orientation="vertical" />
      </div>
    </>
  );
}
