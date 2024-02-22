"use client";

import { Avatar } from "@/app/ui/user/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { PublicUserEntity } from "../../lib/dtos";

function UserCard({ user }: { user?: PublicUserEntity }) {
  const name = user?.name || "";
  const avatarUrl = user?.avatarURL || "/avatar/undefined.jpg";
  const href = user ? `/user/${user.id}` : undefined;
  const id = user?.id;
  return (
    <>
      <div className="flex gap-4 items-center">
        {name}
        <Avatar
          avatarURL={avatarUrl}
          size="medium"
          href={href}
          alt={name}
          id={id}
        />
      </div>
    </>
  );
}

export function GameCard({
  leftPlayer,
  rightPlayer,
}: {
  leftPlayer?: PublicUserEntity;
  rightPlayer?: PublicUserEntity;
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
