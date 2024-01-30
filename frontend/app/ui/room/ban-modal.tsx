"use client";

import { PublicUserEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import BanItem from "./ban-item";
import UnbanItem from "./unban-item";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  roomId: number;
  me: UserOnRoomEntity;
  usersOnRoom: UserOnRoomEntity[];
  allUsers: PublicUserEntity[];
  bannedUsers: PublicUserEntity[];
}
export default function BanModal({
  open,
  setOpen,
  roomId,
  me,
  usersOnRoom,
  allUsers,
  bannedUsers,
}: Props) {
  const owner = usersOnRoom.find((user) => user.role === "OWNER");
  const UnbannedUsers = allUsers?.filter(
    (user) =>
      !bannedUsers?.some((bannedUser) => bannedUser.id === user.id) &&
      user.id !== me?.userId &&
      user.id !== owner?.userId,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2x1 text-center font-bold">
            Manage Ban users
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {bannedUsers?.length !== 0 && (
            <DialogDescription className="text-center text-zinc-500">
              Banned users
            </DialogDescription>
          )}
          {bannedUsers?.map((user) => (
            <UnbanItem key={user.id} roomId={roomId} user={user} />
          ))}
          {UnbannedUsers?.length !== 0 && (
            <DialogDescription className="text-center text-zinc-500">
              Unbanned users
            </DialogDescription>
          )}
          {UnbannedUsers?.map((user) => (
            <BanItem key={user.id} roomId={roomId} user={user} />
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
