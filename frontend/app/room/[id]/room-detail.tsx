import { getBannedUsers, getBlockingUsers } from "@/app/lib/actions";
import type {
  PublicUserEntity,
  RoomEntity,
  UserOnRoomEntity,
} from "@/app/lib/dtos";
import { getCurrentUserId } from "@/app/lib/session";
import { Stack } from "@/components/layout/stack";
import SidebarItem from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";

interface Props {
  room: RoomEntity;
  users: UserOnRoomEntity[];
  allUsers: PublicUserEntity[];
}

export default async function RoomDetail({ room, users, allUsers }: Props) {
  const currentUserId = await getCurrentUserId();
  const me = users.find((u) => u.userId === currentUserId);
  if (!me) {
    throw new Error("User not found");
  }
  const bannedUsers = await getBannedUsers(room.id);
  const blockingUsers = await getBlockingUsers();
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4 flex flex-col gap-2">
      <SidebarMenu
        room={room}
        me={me}
        allUsers={allUsers}
        usersOnRoom={users}
        bannedUsers={bannedUsers}
      />
      <Stack space="space-y-2">
        {users.map((user) => (
          <SidebarItem
            roomId={room.id}
            user={user}
            me={me}
            blockingUsers={blockingUsers}
            key={user.userId}
          />
        ))}
      </Stack>
    </div>
  );
}
