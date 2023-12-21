import { getUser } from "@/app/lib/actions";
import AddFriendButton from "@/app/ui/user/add-friend-button";
import { Avatar } from "@/app/ui/user/avatar";
import MatchRequestButton from "@/app/ui/user/match-request-button";

export default async function FindUser({
  params: { id },
}: {
  params: { id: string };
}) {
  const userId = parseInt(id);
  const user = await getUser(userId);
  // TODO: Implement this
  const isFriend = false; //currentUser.friends.includes(user.id);
  // TODO: Must consider these situations
  // 1. Already friends
  // 2. Friend request sent
  // 3. Friend request received
  // 4. Not friends
  // 5. You
  // 6. Blocked
  // 7. Blocking
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Avatar avatarURL={user.avatarURL} size="large" />
      </div>
      <div className="text-xl font-bold">{user.name}</div>
      <div className="flex gap-4">
        <MatchRequestButton id={userId} />
        <AddFriendButton id={userId} />
      </div>
      <div className="bg-secondary">Match History</div>
      <div className="bg-secondary">Friends</div>
    </div>
  );
}
