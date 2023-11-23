import UserCard from "@/app/ui/user/card";
import type { User } from "@/app/ui/user/card";
import { getUsers } from "@/app/lib/actions";

export default async function UserListPage() {
  const users = await getUsers();
  return (
    <div className="flex flex-wrap gap-8">
      {users.map((user, index) => (
        <UserCard user={user} key={index} />
      ))}
    </div>
  );
}
