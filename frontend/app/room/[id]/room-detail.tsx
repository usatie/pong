import {
  getBannedUsers,
  getBlockingUsers,
  getMutedUsers,
} from "@/app/lib/actions";
import type {
  PublicUserEntity,
  RoomEntity,
  UserOnRoomEntity,
} from "@/app/lib/dtos";
import { getCurrentUserId } from "@/app/lib/session";
import { Stack } from "@/components/layout/stack";
import { DmTitle } from "./dm-title";
import SidebarItem from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";

interface Props {
  room: RoomEntity;
  users: UserOnRoomEntity[];
  allUsers: PublicUserEntity[];
  me: UserOnRoomEntity;
}

export default async function RoomDetail({ room, users, allUsers, me }: Props) {
  const bannedUsers = (await getBannedUsers(room.id)) ?? [];
  const blockingUsers = (await getBlockingUsers()) ?? [];
  const mutedUsers = (await getMutedUsers(room.id)) ?? [];
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4 flex flex-col gap-2">
      {room.accessLevel !== "DIRECT" && (
        <SidebarMenu
          room={room}
          me={me}
          allUsers={allUsers}
          usersOnRoom={users}
          bannedUsers={bannedUsers}
        />
      )}
      {room.accessLevel === "DIRECT" && <DmTitle me={me} users={users} />}
      <Stack space="space-y-2">
        {users.map((user) => (
          <SidebarItem
            room={room}
            user={user}
            me={me}
            blockingUsers={blockingUsers}
            mutedUsers={mutedUsers}
            key={user.userId}
          />
        ))}
      </Stack>
    </div>
  );
}
