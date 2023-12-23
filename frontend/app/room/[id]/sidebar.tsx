import { getCurrentUserId } from "@/app/lib/session";
import type { UserOnRoomEntity } from "@/app/lib/types";
import { Stack } from "@/components/layout/stack";
import SidebarItem from "./sidebar-item";

export async function Sidebar({
  roomId,
  users,
}: {
  roomId: number;
  users: UserOnRoomEntity[];
}) {
  const currentUserId = await getCurrentUserId();
  const me = users.find((u) => u.userId === currentUserId);
  if (!me) {
    throw new Error("User not found");
  }
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4">
      <Stack space="space-y-2">
        {users.map((user) => (
          <SidebarItem roomId={roomId} user={user} me={me} key={user.userId} />
        ))}
      </Stack>
    </div>
  );
}
