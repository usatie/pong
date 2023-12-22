import { getFriendRequests, getFriends, getUser } from "@/app/lib/actions";
import { getCurrentUserId } from "@/app/lib/session";
import AcceptFriendButton from "@/app/ui/user/accept-friend-request-button";
import AddFriendButton from "@/app/ui/user/add-friend-button";
import { Avatar } from "@/app/ui/user/avatar";
import CancelFriendRequestButton from "@/app/ui/user/cancel-friend-request-button";
import Friends from "@/app/ui/user/friends";
import MatchHistory from "@/app/ui/user/match-history";
import MatchRequestButton from "@/app/ui/user/match-request-button";
import RejectFriendButton from "@/app/ui/user/reject-friend-request-button";
import RemoveFriendButton from "@/app/ui/user/remove-friend-button";
import Stats from "@/app/ui/user/stats";

export default async function FindUser({
  params: { id },
}: {
  params: { id: string };
}) {
  const userId = parseInt(id, 10);
  const user = await getUser(userId);
  const requests = await getFriendRequests();
  const currentUserId = await getCurrentUserId();
  const myFriends = await getFriends(currentUserId);
  // check if any requesting contains userId
  const hasSentRequest = requests.requesting.some((r) => r.id === userId);
  const hasReceivedRequest = requests.requestedBy.some((r) => r.id === userId);
  const isFriend = myFriends.some((f) => f.id == userId);
  const canAddFriend = !hasSentRequest && !hasReceivedRequest && !isFriend;
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
      <div className="text-3xl font-bold">{user.name}</div>
      {user.id !== currentUserId && (
        <>
          <div className="flex gap-4">
            {hasSentRequest && <CancelFriendRequestButton id={userId} />}
            {hasReceivedRequest && <AcceptFriendButton id={userId} />}
            {hasReceivedRequest && <RejectFriendButton id={userId} />}
            {isFriend && <RemoveFriendButton id={userId} />}
            {canAddFriend && <AddFriendButton id={userId} />}
          </div>
          <MatchRequestButton id={userId} />
        </>
      )}
      <Friends userId={userId} />
      <Stats userId={userId} />
      <MatchHistory userId={userId} />
    </div>
  );
}
