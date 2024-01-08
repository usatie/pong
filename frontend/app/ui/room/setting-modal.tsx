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
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const settingSchema = z.discriminatedUnion("isProtected", [
  z.object({
    roomName: z.string().min(1, { message: "Please enter room name" }),
    isProtected: z.literal(false),
    password: z.string().optional(),
  }),
  z.object({
    roomName: z.string().min(1, { message: "Please enter room name" }),
    isProtected: z.literal(true),
    password: z
      .string()
      .min(4, { message: "Invalid password: must be at least 4 characters" }),
  }),
]);

export const SettingModal = () => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "setting";
  const { roomId, roomName, accessLevel } = { ...data };

  const onSubmit = async (e: z.infer<typeof settingSchema>) => {
    if (!roomId || !accessLevel) {
      throw new Error("not found room");
    }
    let result;
    if (accessLevel !== "PROTECTED" && e.password === "") {
      result = await updateRoom(e.roomName, roomId, accessLevel);
    } else {
      result = await updateRoom(e.roomName, roomId, accessLevel, e.password);
    }
    if (result === "Success") {
      router.refresh();
      onClose();
    } else {
      setError(result);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      roomName: roomName as string,
      isProtected: accessLevel === "PROTECTED",
      password: "",
    },
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2x1 text-center font-bold">
            Room Setting
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full items-center gap-8">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                className="text-black dark:text-white"
                id="roomName"
                placeholder="Enter room name"
                defaultValue={roomName}
                {...register("roomName")}
              />
              {errors.roomName?.message && (
                <p className="text-red-500">{errors.roomName?.message}</p>
              )}
            </div>
            <div className="hidden">
              <Input
                className="hidden"
                id="isProtected"
                type="checkbox"
                defaultChecked={accessLevel === "PROTECTED"}
                {...register("isProtected")}
              />
            </div>
            {accessLevel === "PROTECTED" && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  className="text-black dark:text-white"
                  id="password"
                  placeholder="Enterr new password"
                  {...register("password")}
                />
                {errors.password?.message && (
                  <p className="text-red-500">{errors.password?.message}</p>
                )}
              </div>
            )}
            {error && (
              <p className="text-red-500">Error: Somehing went wrong</p>
            )}
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
