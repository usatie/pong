"use client";

import { useFormState } from "react-dom";

// components
import { joinRoom } from "@/app/lib/actions";
import { deleteRoom, updateRoom } from "@/app/lib/client-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Room = { id: number; name?: string };

export type { Room };

export default function RoomCard({ room }: { room: Room }) {
  const [joinCode, joinAction] = useFormState(joinRoom, undefined);
  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>Room ID: {room.id}</CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              updateRoom(e, room.id);
            }}
            id={"UpdateRoomForm." + room.id}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={room.name}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <form action={joinAction}>
            <input type="hidden" name="roomId" value={room.id} />
            <Button type="submit">Join</Button>
          </form>
          <Button
            type="button"
            onClick={(e) => {
              deleteRoom(e, room.id);
            }}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            type="submit"
            form={"UpdateRoomForm." + room.id}
          >
            Update
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
