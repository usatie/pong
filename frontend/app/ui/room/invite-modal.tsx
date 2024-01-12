"use client";

import { inviteUserToRoom } from "@/app/lib/actions";
import { PublicUserEntity, RoomEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import { Avatar } from "@/app/ui/user/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const UnbannedUsers = allUsers?.filter(
    (user) =>
      !bannedUsers?.some((bannedUser) => bannedUser.id === user.id) &&
      user.id !== me?.userId,
  );

  const OtherThanMembers = UnbannedUsers?.filter(
    (user) => !members?.some((member) => member.id === user.id),
  );

  const onInvite = async (userId: number) => {
    if (!room.id) {
      throw new Error("not found room");
    }
    const res = await inviteUserToRoom(room.id, userId);
    if (res !== "Success") {
      throw new Error("failed to invite");
    }
    const newMember = OtherThanMembers?.find((user) => user.id === userId);
    if (newMember) {
      members?.push(newMember);
      router.refresh();
    }
  };

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
            <div
              key={user.id}
              onClick={() => onInvite(user.id)}
              className="flex items-center gap-x-2 mb-6"
            >
              <Avatar avatarURL={user.avatarURL} size="medium" />
              <div className="flex flex-col gap-y-1">
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {user.name}
                </div>
              </div>
              <button className="text-indigo-500 ml-auto">
                <LogIn className="h-4 w-4 ml-2" />
                Add
              </button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
