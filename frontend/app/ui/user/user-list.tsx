import type { PublicUserEntity } from "@/app/lib/dtos";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AvatarSize } from "./avatar";
import UserTooltip from "./user-tool-tip";

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
          <UserTooltip key={u.id} user={u} avatarSize={avatarSize} />
        ))}
      </div>
    </TooltipProvider>
  );
}
