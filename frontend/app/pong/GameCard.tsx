"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import UserTooltip from "../ui/user/user-tool-tip";
import { PublicUserEntity } from "../lib/dtos";
import { useRouter } from "next/navigation";

function UserCard({ user }: { user: PublicUserEntity }) {
  return (
    <>
      <div className="flex gap-4 items-center">
        {user.name}
        <UserTooltip user={user} avatarSize="medium" />
      </div>
    </>
  );
}

export function GameCard({
  roomId,
  players,
}: {
  roomId: number;
  players: PublicUserEntity[];
}) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/pong/${roomId}?mode=viewer`);
  };

  return (
    <Card className="w-[350px] p-4 flex flex-col gap-2 items-center">
      <div className="flex gap-10 items-center justify-evenly">
        <TooltipProvider delayDuration={0}>
          <UserCard user={players[0]} />
          {" vs "}
          <UserCard user={players[1]} />
        </TooltipProvider>
      </div>
      <Button onClick={handleView}>View</Button>
    </Card>
  );
}
