import UserCard from "@/app/ui/user/card";
import { cookies } from "next/headers";
import { getUser } from "@/app/lib/actions";

export default async function FindUser({
  params: { id },
}: {
  params: { id: number };
}) {
  const user = await getUser(id);
  console.log(user);
  return <UserCard user={user} />;
}
