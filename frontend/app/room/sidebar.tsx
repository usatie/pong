import { Stack } from "@/app/ui/layout/stack";
import type { User } from "@/app/ui/user/card";
import { SidebarButton } from "./sidebar-button";

export type UserOnRoom = {
  id: number;
  userId: number;
  role: string;
  roomId: number;
};

export type UserWithRole<T> = T & {
  role: "MEMBER" | "ADMINISTRATOR" | "OWNER";
};

export async function Sidebar({
  roomId,
  myInfo,
  users,
}: {
  roomId: number;
  myInfo: UserOnRoom;
  users: UserWithRole<User>[];
}) {
  if (users.length === 0) {
    return (
      <div className="overflow-y-auto shrink-0 basis-36 pb-4">
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          No users found
        </span>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4">
      <Stack spacing={2}>
        {users.map((user, index) => (
          <SidebarButton
            roomId={roomId}
            user={user}
            myInfo={myInfo}
            key={user.id}
          />
        ))}
      </Stack>
    </div>
  );
}
