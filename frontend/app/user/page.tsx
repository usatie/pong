import { getUsers } from "@/app/lib/actions";
import UserCard from "@/app/ui/user/card";

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
