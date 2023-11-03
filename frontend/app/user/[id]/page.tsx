import UserCard from "@/app/ui/user/card";

async function getUser(id: number) {
  const res = await fetch(`${process.env.API_URL}/user/${id}`, {
    cache: "no-cache",
  });
  const user = await res.json();
  return user;
}

export default async function FindUser({
  params: { id },
}: {
  params: { id: number };
}) {
  const user = await getUser(id);
  return <UserCard user={user} />;
}
