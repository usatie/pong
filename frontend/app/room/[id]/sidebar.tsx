import type { PublicUserEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import { getCurrentUserId } from "@/app/lib/session";
import { Stack } from "@/components/layout/stack";
import SidebarItem from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { getBannedUsers } from "@/app/lib/actions";

export async function Sidebar({
  roomId,
  roomName,
  users,
  allUsers,
}: {
  roomId: number;
  roomName: string;
  users: UserOnRoomEntity[];
  allUsers: PublicUserEntity[];
}) {
  const currentUserId = await getCurrentUserId();
  const me = users.find((u) => u.userId === currentUserId);
  if (!me) {
    throw new Error("User not found");
  }
  const bannedUsers = await getBannedUsers(roomId);
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4">
      <SidebarMenu
        roomId={roomId}
        roomName={roomName}
        me={me}
        allUsers={allUsers}
        bannedUsers={bannedUsers}
      />
      <Stack space="space-y-2">
        {users.map((user) => (
          <SidebarItem roomId={roomId} user={user} me={me} key={user.userId} />
        ))}
      </Stack>
    </div>
  );
}
