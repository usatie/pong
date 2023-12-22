import { getFriends } from "@/app/lib/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Avatar } from "./avatar";
import ProfileItem from "./profile-item";

export default async function Friends({ userId }: { userId: number }) {
  const friends = await getFriends(userId);
  return (
    <ProfileItem title="Friends">
      <TooltipProvider delayDuration={0}>
        <div className="flex gap-1">
          {friends.length === 0 && <div>No friends</div>}
          {friends.map((friend) => (
            <Tooltip key={friend.id}>
              <TooltipTrigger>
                <Link href={`/user/${friend.id}`} key={friend.id}>
                  <Avatar
                    avatarURL={friend.avatarURL}
                    size="medium"
                    alt={friend.name}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>{friend.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </ProfileItem>
  );
}
