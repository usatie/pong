import { Stack } from "@/app/ui/layout/stack";
import { SmallAvatarSkeleton } from "./skeleton";
import type { User } from "./test-data";

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export function Sidebar({ users }: { users: User[] }) {
  // TODO: If users is empty, show a message like "No users found"
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4">
      <Stack spacing={2}>
        {users.map((user) => (
          <button
            key={user.id}
            className="flex gap-2 items-center group hover:opacity-60"
          >
            <SmallAvatarSkeleton />
            <span className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
              {truncateString(user.name, 15)}
            </span>
          </button>
        ))}
      </Stack>
    </div>
  );
}
