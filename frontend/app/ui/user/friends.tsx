import { getFriends } from "@/app/lib/actions";
import ProfileItem from "./profile-item";
import UserList from "./user-list";

export default async function Friends({ userId }: { userId: number }) {
  const friends = await getFriends(userId);
  return (
    <ProfileItem title="Friends">
      <UserList users={friends} avatarSize="medium" />
    </ProfileItem>
  );
}
