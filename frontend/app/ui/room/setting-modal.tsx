"use client";

import { AccessLevel } from "@/app/lib/dtos";
import { updateRoom } from "@/app/lib/actions";
import { AccessLevel } from "@/app/lib/dtos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const settingSchema = z.discriminatedUnion("selectedAccessLevel", [
  z.object({
    roomName: z.string().min(1, { message: "Please enter room name" }),
    selectedAccessLevel: z.enum(["PUBLIC", "PRIVATE"]),
    password: z.string().optional(),
  }),
  z.object({
    roomName: z.string().min(1, { message: "Please enter room name" }),
    selectedAccessLevel: z.literal("PROTECTED"),
    password: z
      .string()
      .min(4, { message: "Invalid password: must be at least 4 characters" }),
  }),
]);

export default function SettingModal({
  open,
  setOpen,
  roomId,
  roomName,
  accessLevel,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  roomId: number;
  roomName: string;
  accessLevel: AccessLevel;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);

  const onSubmit = async (e: z.infer<typeof settingSchema>) => {
    if (!roomId || !accessLevel) {
      throw new Error("not found room");
    }
    let result;
    if (e.selectedAccessLevel !== "PROTECTED") {
      result = await updateRoom(e.roomName, roomId, e.selectedAccessLevel);
    } else {
      result = await updateRoom(
        e.roomName,
        roomId,
        e.selectedAccessLevel,
        e.password,
      );
    }
    if (result === "Success") {
      router.refresh();
      setOpen(false);
    } else {
      setError(result);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      roomName: roomName as string,
      selectedAccessLevel: accessLevel as AccessLevel,
      password: "",
    },
  });

  const selectedAccessLevel = watch("selectedAccessLevel", accessLevel);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Label htmlFor="accessLevel">Access Level</Label>
            <select
              className="bg-white text-black"
              defaultValue={accessLevel}
              {...register("selectedAccessLevel")}
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PROTECTED">PROTECTED</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
            {selectedAccessLevel === "PROTECTED" && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  className="text-black dark:text-white"
                  id="password"
                  placeholder="Enter new password"
                  {...register("password")}
                />
                {errors.password?.message && (
                  <p className="text-red-500">{errors.password?.message}</p>
                )}
              </div>
            )}
            {error && (
              <p className="text-red-500">Error: Something went wrong</p>
            )}
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
