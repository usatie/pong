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
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinRoomForm({}) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    router.push(`/pong/${inputValue}?mode=player`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join room</CardTitle>
        <CardDescription>
          Join a room to play pong with your friend
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
