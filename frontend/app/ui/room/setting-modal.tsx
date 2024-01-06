"use client";

import { updateRoom } from "@/app/lib/actions";
import { useModal } from "@/app/lib/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export const SettingModal = () => {
  const router = useRouter();
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "setting";
  const { roomId, roomName, accessLevel } = { ...data };

  const onSubmit = async (e: FormData) => {
    if (!roomId || !accessLevel) {
      throw new Error("not found room");
    }
    await updateRoom(e, roomId, accessLevel);
    router.refresh();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2x1 text-center font-bold">
            Room Setting
          </DialogTitle>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid w-full items-center gap-8">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                className="text-black dark:text-white"
                id="roomName"
                name="roomName"
                placeholder="Enter room name"
                defaultValue={roomName}
              />
            </div>
            {accessLevel === "PROTECTED" && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  className="text-black dark:text-white"
                  id="password"
                  name="password"
                  placeholder="Enterr new password"
                />
              </div>
            )}
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
