"use client";

import { useRouter } from "next/navigation";

// components
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
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export type Room = { id: number; name?: string; };

export default function RoomCard({ room }: { room: room }) {
  const router = useRouter();
  const { toast } = useToast();
  async function updateRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { id, ...updateData } = Object.fromEntries(
      new FormData(event.currentTarget),
    );
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/room/${room.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: res.status + " " + res.statusText,
        description: data.message,
      });
    } else {
      toast({
        title: "Success",
        description: "room updated successfully.",
      });
      router.push("/room");
      router.refresh();
    }
  }
  async function deleteRoom(event: React.SyntheticEvent) {
    event.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/room/${room.id}`,
      {
        method: "DELETE",
      },
    );
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: res.status + " " + res.statusText,
        description: data.message,
      });
    } else {
      toast({
        title: "Success",
        description: "room deleted successfully.",
      });
      router.push("/room");
      router.refresh();
    }
  }
  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>Room ID: {room.id}</CardHeader>
        <CardContent>
          <form onSubmit={updateRoom} id={"UpdateRoomForm." + room.id}>
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
          <Button asChild>
            <Link href={`/room/${room.id}`}>Join</Link>
          </Button>
          <Button type="button" onClick={deleteRoom}>
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
