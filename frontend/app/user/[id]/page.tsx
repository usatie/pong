import { getFriends, getUser } from "@/app/lib/actions";
import { getCurrentUser } from "@/app/lib/session";
import { Avatar } from "@/app/ui/room/skeleton";
import AddFriendButton from "@/app/ui/user/add-friend-button";

export default async function FindUser({
  params: { id },
}: {
  params: { id: string };
}) {
  const userId = parseInt(id);
  const user = await getUser(userId);
  const currentUser = await getCurrentUser();
  const friends = await getFriends();
  console.log(friends);
  const isFriend = false; //currentUser.friends.includes(user.id);
  // TODO: Must consider these situations
  // 1. Already friends
  // 2. Friend request sent
  // 3. Friend request received
  // 4. Not friends
  // 5. You
  // 6. Blocked
  // 7. Blocking
  console.log(user);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Avatar avatarURL={user.avatarURL} />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">{user.name}</div>
        <AddFriendButton id={userId} />
      </div>
      <div className="bg-secondary">Match History</div>
      <div className="bg-secondary">Friends</div>
    </div>
  );
}
