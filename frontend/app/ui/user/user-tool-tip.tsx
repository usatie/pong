import type { PublicUserEntity } from "@/app/lib/dtos";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Avatar, AvatarSize } from "./avatar";

// This component has to be used with TooltipProvider
export default function UserTooltip({
  user,
  avatarSize,
}: {
  user: PublicUserEntity;
  avatarSize: AvatarSize;
}) {
  return (
    <Tooltip key={user.id}>
      <TooltipTrigger>
        <Link href={`/user/${user.id}`} key={user.id}>
          <Avatar
            avatarURL={user.avatarURL}
            size={avatarSize}
            alt={user.name}
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{user.name}</TooltipContent>
    </Tooltip>
  );
}
