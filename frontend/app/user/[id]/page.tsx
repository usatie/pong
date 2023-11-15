import UserCard from "@/app/ui/user/card";
import { cookies } from "next/headers";

async function getUser(id: number) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("token");
  const res = await fetch(`${process.env.API_URL}/user/${id}`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + accessToken.value,
    },
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
  console.log(user);
  return <UserCard user={user} />;
}
