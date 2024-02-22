"use client";

import { Avatar } from "@/app/ui/user/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { PublicUserEntity } from "../../lib/dtos";

function UserCard({ user }: { user: PublicUserEntity }) {
  return (
    <>
      <div className="flex gap-4 items-center">
        {user.name}
        <Avatar
          avatarURL={user.avatarURL}
          size="medium"
          href={`/user/${user.id}`}
          alt={user.name}
          id={user.id}
        />
      </div>
    </>
  );
}

export function GameCard({
  leftPlayer,
  rightPlayer,
}: {
  leftPlayer: PublicUserEntity;
  rightPlayer: PublicUserEntity;
}) {
  return (
    <Card className="w-[350px] p-4 flex flex-col gap-2 items-center">
      <div className="flex gap-10 items-center justify-evenly">
        <TooltipProvider delayDuration={0}>
          <UserCard user={leftPlayer} />
          {" vs "}
          <UserCard user={rightPlayer} />
        </TooltipProvider>
      </div>
    </Card>
  );
}