"use client";
import { createRoom } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CreateRoomForm() {
  return (
    <form action={createRoom} id="create-room-form">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. 42Tokyo Room"
        />
        <Label htmlFor="accessLevel">Access Level</Label>
        <select defaultValue="PUBLIC" id="accessLevel" name="accessLevel">
          <option value="PUBLIC">PUBLIC</option>
          <option value="PROTECTED">PROTECTED</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="At least 6 characters. (PROTECTED ROOM ONLY)"
        />
      </div>
    </form>
  );
}

export default function CreateRoomDialog() {
  return (
    <Dialog>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button className="px-2">+</button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Create Room</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Room</DialogTitle>
          <DialogDescription>Let&apos;s create a room</DialogDescription>
        </DialogHeader>
        <CreateRoomForm />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="create-room-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
