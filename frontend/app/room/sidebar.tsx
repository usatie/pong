"use client";

import { Stack } from "@/app/ui/layout/stack";
import type { User } from "@/app/ui/user/card";
import { toast } from "@/components/ui/use-toast";
import { chatSocket as socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarButton } from "./sidebar-button";

export type UserOnRoom = {
  id: number;
  userId: number;
  role: string;
  roomId: number;
};

export type UserWithRole<T> = T & {
  role: "MEMBER" | "ADMINISTRATOR" | "OWNER";
};

export function Sidebar({
  roomId,
  myInfo,
  users,
}: {
  roomId: number;
  myInfo: UserOnRoom;
  users: UserWithRole<User>[];
}) {
  const router = useRouter();
  const [currentUsers, setCurrentUsers] = useState(users);

  useEffect(() => {
    const handleKick = (kickId: number) => {
      if (kickId === myInfo.userId) {
        router.push("/room");
      } else {
        toast({
          title: "User kicked successfully",
          description: "User " + kickId + " has been kicked",
        });
        setCurrentUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== kickId),
        );
      }
    };
    socket.on("kick", handleKick);
    return () => {
      socket.off("kick", handleKick);
    };
  }, [myInfo.userId, router]);

  if (currentUsers.length === 0) {
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
        {currentUsers.map((user, index) => (
          <SidebarButton
            roomId={roomId}
            user={user}
            myInfo={myInfo}
            key={user.id}
          />
        ))}
      </Stack>
    </div>
  );
}
