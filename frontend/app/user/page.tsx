import UserCard from "@/app/ui/user/card";
import type { User } from "@/app/ui/user/card";

async function getUsers(): Promise<User[]> {
  const res = await fetch(`${process.env.API_URL}/user`, {
    cache: "no-cache",
  });
  const users = await res.json();
  return users;
}

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
