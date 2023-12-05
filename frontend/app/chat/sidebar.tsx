import { Stack } from "@/app/ui/layout/stack";
import type { User } from "@/app/ui/user/card";
import { SidebarButton } from "./sidebar-button";

export function Sidebar({ users }: { users: User[] }) {
  // TODO: If users is empty, show a message like "No users found"
  if (users.length === 0) {
    return (
      <div className="overflow-y-auto shrink-0 basis-36 pb-4">
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          No users found
        </span>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto shrink-0 basis-36 pb-4">
      <Stack spacing={2}>
        {users.map((user) => (
          <SidebarButton user={user} key={user.id} />
        ))}
      </Stack>
    </div>
  );
}
