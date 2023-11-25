import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getUsers } from "@/app/lib/actions";
import { getUserId } from "@/app/lib/session";
import { UserButton } from "@/app/ui/direct-message/user-button";

const DirectMessageSidebar = async () => {
  const users = await getUsers();
  if (!users) {
    console.error("getUsers Error");
    return null;
  }
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error("getUserId Error");
    return null;
  }
  return (
    <div>
      <Card className="flex flex-col h-full text-primary w-full dark:bg-[#1E1F22] bg-[#F2F3F5]">
        <CardHeader className="flex mt-1 py-1 items-center">
          <b>Users</b>
        </CardHeader>
        <CardContent className="flex items-start p-3 pt-2">
          <ScrollArea className="flex-1 px-1">
            <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md mb-2" />
            <div className="space-y-[2px]">
              {users.map(
                (user) =>
                  parseInt(currentUserId) !== user.id && (
                    <ul key={user.id}>
                      <UserButton key={user.id} user={user} />
                    </ul>
                  ),
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectMessageSidebar;