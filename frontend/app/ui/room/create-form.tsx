"use client";

import { createRoom } from "@/app/lib/actions";

// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RoomCreateForm() {
  return (
    <form action={createRoom}>
      <div className="grid w-full items-center gap-8">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Room Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="e.g. temporary room"
          />
        </div>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}
