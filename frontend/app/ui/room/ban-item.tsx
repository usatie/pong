"use client";

import { banUser } from "@/app/lib/actions";
import { PublicUserEntity } from "@/app/lib/dtos";
import { Avatar } from "@/app/ui/user/avatar";
import Loader from "@/components/ui/loader";
import { toast } from "@/components/ui/use-toast";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const showBanErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to ban user",
  });
};

export default function BanItem({
  roomId,
  user,
}: {
  roomId: number;
  user: PublicUserEntity;
}) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const ban = async () => {
    setIsClicked(true);
    const result = await banUser(roomId, user.id);
    if (result === "Success") {
      router.refresh();
    } else {
      showBanErrorToast();
      setIsClicked(false);
    }
  };

  return (
    <div key={user.id} className="flex items-center gap-x-2 mb-6">
      <Avatar avatarURL={user.avatarURL} size="medium" id={user.id} />
      <div className="flex flex-col gap-y-1">
        <div className="text-xs font-semibold flex items-center gap-x-1">
          {user.name}
        </div>
      </div>
      {isClicked && <Loader className="ml-auto" />}
      {!isClicked && (
        <button
          onClick={ban}
          disabled={isClicked}
          className="text-rose-500 ml-auto"
        >
          <Ban className="h-4 w-4 ml-2" />
          BAN
        </button>
      )}
    </div>
  );
}
