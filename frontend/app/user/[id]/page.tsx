import {
  getBlockingUsers,
  getFriendRequests,
  getFriends,
  getUser,
} from "@/app/lib/actions";
import { getCurrentUserId } from "@/app/lib/session";
import AcceptFriendButton from "@/app/ui/user/accept-friend-request-button";
import AddFriendButton from "@/app/ui/user/add-friend-button";
import { Avatar } from "@/app/ui/user/avatar";
import BlockButton from "@/app/ui/user/block-button";
import CancelFriendRequestButton from "@/app/ui/user/cancel-friend-request-button";
import DirectMessageButton from "@/app/ui/user/direct-message-button";
import Friends from "@/app/ui/user/friends";
import MatchHistory from "@/app/ui/user/match-history";
import MatchRequestButton from "@/app/ui/user/match-request-button";
import RejectFriendButton from "@/app/ui/user/reject-friend-request-button";
import RemoveFriendButton from "@/app/ui/user/remove-friend-button";
import Stats from "@/app/ui/user/stats";
import UnBlockButton from "@/app/ui/user/unblock-button";
import { notFound } from "next/navigation";

export default async function FindUser({
  params: { id },
}: {
  params: { id: string };
}) {
  const userId = parseInt(id, 10);
  const user = await getUser(userId);
  if (!user) {
    notFound();
  }
  const requests = await getFriendRequests();
  const currentUserId = await getCurrentUserId();
  const myFriends = await getFriends(currentUserId);
  const blockingUsers = await getBlockingUsers();
  // check if any requesting contains userId
  const hasSentRequest = requests.requesting.some((r) => r.id === userId);
  const hasReceivedRequest = requests.requestedBy.some((r) => r.id === userId);
  const isFriend = myFriends.some((f) => f.id == userId);
  const isBlocking = blockingUsers.some((b) => b.id === userId);
  const canAddFriend =
    !hasSentRequest && !hasReceivedRequest && !isFriend && !isBlocking;
  const canAcceptFriend = hasReceivedRequest && !isFriend && !isBlocking;
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
        <Avatar avatarURL={user.avatarURL} size="large" id={user.id} />
      </div>
      <div className="text-3xl font-bold">{user.name}</div>
      {user.id !== currentUserId && (
        <>
          <div className="flex gap-4">
            {hasSentRequest && <CancelFriendRequestButton id={userId} />}
            {canAcceptFriend && <AcceptFriendButton id={userId} />}
            {hasReceivedRequest && <RejectFriendButton id={userId} />}
            {isFriend && <RemoveFriendButton id={userId} />}
            {canAddFriend && <AddFriendButton id={userId} />}
            {!isBlocking && <BlockButton id={userId} />}
            {isBlocking && <UnBlockButton id={userId} />}
          </div>
          <DirectMessageButton id={userId} />
          <MatchRequestButton id={userId} />
        </>
      )}
      <Friends userId={userId} />
      <Stats userId={userId} />
      <MatchHistory userId={userId} />
    </div>
  );
}
