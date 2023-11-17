"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

export default function JoinRoomForm() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const handleSubmit = () => {
    router.push(`/pong/${inputValue}`);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Join room</CardTitle>
        <CardDescription>
          Join a room to play pong with your friend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                placeholder="ID of pong room you friend told you"
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleSubmit}>Join</Button>
      </CardFooter>
    </Card>
  );
}
