"use client";
import { createRoom } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { useFormState, useFormStatus } from "react-dom";

export function CreateRoomForm({ error }: { error?: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Room</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={pending}>
            Create
          </Button>
        </DialogFooter>
        {error && <div className="text-red-500 text-end">{error}</div>}
      </div>
    </>
  );
}

export default function CreateRoomDialog() {
  const [state, action] = useFormState(createRoom, { error: undefined });
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
        <form action={action} className="flex flex-col gap-4">
          <CreateRoomForm error={state.error} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
