import { getUser } from "@/app/lib/actions";
import UserCard from "@/app/ui/user/card";

export default async function FindUser({
  params: { id },
}: {
  params: { id: number };
}) {
  const user = await getUser(id);
  console.log(user);
  return <UserCard user={user} />;
}
