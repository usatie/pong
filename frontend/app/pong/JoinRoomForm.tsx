"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { v4 } from "uuid";
import MatchButton from "./MatchButton";

export default function JoinRoomForm({}) {
  return (
    <Card className="basis-1/3">
      <CardHeader>
        <CardTitle>Play Pong</CardTitle>
        <CardDescription>Lets play pong with your friend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <CreateRoomButton />
          <OrSeparator />
          <MatchButton />
        </div>
      </CardContent>
    </Card>
  );
}

function OrSeparator() {
  return (
    <div className="flex gap-4 w-full">
      <Separator className="shrink self-center" />
      OR
      <Separator className="shrink self-center" />
    </div>
  );
}

function CreateRoomButton() {
  const randomRoomId = v4();
  return (
    <Button asChild>
      <Link href={`/pong/${randomRoomId}`}>Create a new room</Link>
    </Button>
  );
}
