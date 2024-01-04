"use client";

import { banUser } from "@/app/lib/actions";
import { useModal } from "@/app/lib/hooks/use-modal-store";
import { Avatar } from "@/app/ui/user/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";

export const BanModal = () => {
  const router = useRouter();
  const { onOpen, isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "ban";
  console.log(data);
  const { roomId, roomName, me, allUsers } = { ...data };
  console.log(roomId, roomName, me, allUsers);

  const onBan = async (userId: number) => {
    console.log("onBan");
    if (!roomId) {
      throw new Error("not found room");
    }
    banUser(roomId, userId);
    // ban action
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
          {allUsers?.map((user) => (
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
