import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getUsers } from "@/app/lib/actions";
import { getUserId } from "@/app/lib/session";
import { UserButton } from "@/app/direct-message/user-button";

const DirectMessageSidebar = async () => {
  const users = await getUsers();
  const currentUserId = await getUserId();
  if (!users) {
    console.error("getUsers Error");
    return NULL;
  }
  return (
    <div
      className="flex flex-col h-full text-primary items-center w-full dark:bg-[#1E1F22] bg-[#F2F3F5]"
    >
      Other Users
      <ScrollArea className="flex-1 px-3">
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"/>
        <div className="space-y-[2px]">
          {users.map((user, index) => (
             currentUserId !== user.id && <UserButton key={index} user={user} />
            )
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default DirectMessageSidebar;
