"use client";
import { joinRoom } from "@/app/lib/actions";
import { RoomEntity } from "@/app/lib/dtos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";

export default function RoomCard({ room }: { room: RoomEntity }) {
  const [code, action] = useFormState(joinRoom.bind(null, room.id), undefined);
  return (
    <Card className="basis-64">
      <form action={action}>
        <CardHeader>
          <CardTitle>{room.name}</CardTitle>
          <CardDescription>{room.accessLevel}</CardDescription>
        </CardHeader>
        {room.accessLevel === "PROTECTED" ? (
          <CardContent>
            <Input
              id="password"
              name="password"
              type="password"
              aria-label="Password"
              placeholder="Enter password"
            />
          </CardContent>
        ) : null}
        <CardFooter>
          <div className="flex-1 flex flex-col gap-2 items-center">
            <Button type="submit" variant={"outline"} className="w-full">
              Join
            </Button>
            {code?.error ? (
              <p className="text-sm text-primary">{code.error}</p>
            ) : null}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
