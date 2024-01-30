"use client";

import type { PublicUserEntity } from "@/app/lib/dtos";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarSize } from "./avatar";
<<<<<<< Updated upstream
=======
import { useEffect, useState } from "react";
import { isOnline } from "@/app/lib/actions";
>>>>>>> Stashed changes

export default function UserList({
  users,
  avatarSize,
}: {
  users: PublicUserEntity[];
  avatarSize: AvatarSize;
}) {
  const [onlineStatus, setOnlineStatus] = useState<{ [key: string]: boolean }>(
    {}
  );

  const fetchOnlineStatus = async () => {
    try {
      users.forEach(async (u) => {
        const online = await isOnline(u.id);
        setOnlineStatus((prev) => ({ ...prev, [u.name]: online }));
      });
    } catch (error) {
      console.error("Error fetching online status:", error);
    }
  };

  useEffect(() => {
    fetchOnlineStatus();
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-wrap gap-2">
        {users.length === 0 && <div>No users to display</div>}
        {users.map((u) => (
          <Avatar
            avatarURL={u.avatarURL}
            size={avatarSize}
            href={`/user/${u.id}`}
            alt={u.name}
            online={onlineStatus[u.name]}
            key={u.id}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}
