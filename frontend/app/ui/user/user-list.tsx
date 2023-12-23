import type { PublicUserEntity } from "@/app/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Avatar, AvatarSize } from "./avatar";

export default function UserList({
  users,
  avatarSize,
}: {
  users: PublicUserEntity[];
  avatarSize: AvatarSize;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-wrap gap-2">
        {users.length === 0 && <div>No users to display</div>}
        {users.map((u) => (
          <Tooltip key={u.id}>
            <TooltipTrigger>
              <Link href={`/user/${u.id}`} key={u.id}>
                <Avatar
                  avatarURL={u.avatarURL}
                  size={avatarSize}
                  alt={u.name}
                />
              </Link>
            </TooltipTrigger>
            <TooltipContent>{u.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
