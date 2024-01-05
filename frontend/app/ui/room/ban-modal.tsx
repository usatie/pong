"use client";

import { banUser, unbanUser } from "@/app/lib/actions";
import { useModal } from "@/app/lib/hooks/use-modal-store";
import { Avatar } from "@/app/ui/user/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ban, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const BanModal = () => {
  const router = useRouter();
  const { onOpen, isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "ban";
  const { roomId, roomName, me, allUsers, bannedUsers } = { ...data };

  const UnbannedUsers = allUsers?.filter(
    (user) =>
      !bannedUsers?.some((bannedUser) => bannedUser.id === user.id) &&
      user.id !== me?.userId,
  );

  const onBan = async (userId: number) => {
    if (!roomId) {
      throw new Error("not found room");
    }
    banUser(roomId, userId);
    const bannedUser = allUsers?.find((user) => user.id === userId);
    if (bannedUser) {
      bannedUsers?.push(bannedUser);
      router.refresh();
      onOpen("ban", { roomId, roomName, me, allUsers, bannedUsers });
    }
  };

  const onUnban = async (userId: number) => {
    if (!roomId) {
      throw new Error("not found room");
    }
    unbanUser(roomId, userId);
    bannedUsers?.splice(
      bannedUsers.findIndex((user) => user.id === userId),
      1,
    );
    router.refresh();
    onOpen("ban", { roomId, roomName, me, allUsers, bannedUsers });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
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
            <div
              key={user.id}
              onClick={() => onUnban(user.id)}
              className="flex items-center gap-x-2 mb-6"
            >
              <Avatar avatarURL={user.avatarURL} size="medium" />
              <div className="flex flex-col gap-y-1">
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {user.name}
                  <div className="text-rose-500">Banned</div>
                </div>
              </div>
              <button className="text-indigo-600 dark:text-indigo-400 ml-auto">
                <CheckCircle2 className="h-4 w-4 ml-5" />
                UNBAN
              </button>
            </div>
          ))}
          {UnbannedUsers?.length !== 0 && (
            <DialogDescription className="text-center text-zinc-500">
              Unbanned users
            </DialogDescription>
          )}
          {UnbannedUsers?.map((user) => (
            <div
              key={user.id}
              onClick={() => onBan(user.id)}
              className="flex items-center gap-x-2 mb-6"
            >
              <Avatar avatarURL={user.avatarURL} size="medium" />
              <div className="flex flex-col gap-y-1">
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {user.name}
                </div>
              </div>
              <button className="text-rose-500 ml-auto">
                <Ban className="h-4 w-4 ml-2" />
                BAN
              </button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
