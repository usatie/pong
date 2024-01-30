"use client";

import { inviteUserToRoom } from "@/app/lib/actions";
import { PublicUserEntity } from "@/app/lib/dtos";
import { Avatar } from "@/app/ui/user/avatar";
import Loader from "@/components/ui/loader";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InviteItem({
  roomId,
  user,
}: {
  roomId: number;
  user: PublicUserEntity;
}) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const onInvite = async (userId: number) => {
    setIsClicked(true);
    if (!roomId) {
      throw new Error("not found room");
    }
    const res = await inviteUserToRoom(roomId, userId);
    if (res !== "Success") {
      throw new Error("failed to invite");
    }
    router.refresh();
  };

  return (
    <div key={user.id} className="flex items-center gap-x-2 mb-6">
      <Avatar avatarURL={user.avatarURL} size="medium" />
      <div className="flex flex-col gap-y-1">
        <div className="text-xs font-semibold flex items-center gap-x-1">
          {user.name}
        </div>
      </div>
      {isClicked && <Loader className="ml-auto" />}
      {!isClicked && (
        <button
          onClick={() => onInvite(user.id)}
          className="text-indigo-500 ml-auto"
        >
          <LogIn className="h-4 w-4 ml-2" />
          Add
        </button>
      )}
    </div>
  );
}
