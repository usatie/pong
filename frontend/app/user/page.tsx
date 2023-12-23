import { getUsers } from "@/app/lib/actions";
import UserList from "@/app/ui/user/user-list";

export default async function UserListPage() {
  const users = await getUsers();
  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold text-4xl">All Users</div>
      <UserList users={users} avatarSize="large"></UserList>
    </div>
  );
}
