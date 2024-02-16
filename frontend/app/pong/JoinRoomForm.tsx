"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 } from "uuid";
import MatchButton from "./MatchButton";

export default function JoinRoomForm({}) {
  return (
    <Card className="basis-1/3">
      <CardHeader>
        <CardTitle>Join room</CardTitle>
        <CardDescription>
          Join a room to play pong with your friend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Form />
          <OrSeparator />
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

function Form() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    router.push(`/pong/${inputValue}?mode=player`);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="id">ID</Label>
          <Input
            id="id"
            placeholder="ID of pong room you friend told you"
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <Button>Join</Button>
      </div>
    </form>
  );
}
