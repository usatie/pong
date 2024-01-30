"use client";

import { PublicUserEntity, RoomEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogIn } from "lucide-react";
import InviteItem from "./invite-item";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  room: RoomEntity;
  me: UserOnRoomEntity;
  members: PublicUserEntity[];
  allUsers: PublicUserEntity[];
  bannedUsers: PublicUserEntity[];
}

export default function InviteModal({
  open,
  setOpen,
  room,
  me,
  members,
  allUsers,
  bannedUsers,
}: Props) {
  const UnbannedUsers = allUsers?.filter(
    (user) =>
      !bannedUsers?.some((bannedUser) => bannedUser.id === user.id) &&
      user.id !== me?.userId,
  );

  const OtherThanMembers = UnbannedUsers?.filter(
    (user) => !members?.some((member) => member.id === user.id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2x1 text-center font-bold">
            Add users
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {OtherThanMembers?.length === 0 && (
            <DialogDescription className="text-center text-zinc-500">
              No users to add
            </DialogDescription>
          )}
          {OtherThanMembers?.length !== 0 && (
            <DialogDescription className="text-center text-zinc-500">
              Users
            </DialogDescription>
          )}
          {OtherThanMembers?.map((user) => (
            <InviteItem key={user.id} roomId={room.id} user={user} />
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
