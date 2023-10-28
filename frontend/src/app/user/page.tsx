import UserCard from "@/components/UserCard";

export type User = { id: number; name?: string; email?: string };

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
