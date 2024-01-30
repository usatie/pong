"use client";

import { unbanUser } from "@/app/lib/actions";
import { PublicUserEntity } from "@/app/lib/dtos";
import { Avatar } from "@/app/ui/user/avatar";
import Loader from "@/components/ui/loader";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

const showUnbanErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to unban user",
  });
};

export default function UnbanItem({
  roomId,
  user,
}: {
  roomId: number;
  user: PublicUserEntity;
}) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const onUnban = async (userId: number) => {
    setIsClicked(true);
    const result = await unbanUser(roomId, userId);
    if (result === "Success") {
      router.refresh();
    } else {
      showUnbanErrorToast();
      setIsClicked(false);
    }
  };

  return (
    <div key={user.id} className="flex items-center gap-x-2 mb-6">
      <Avatar avatarURL={user.avatarURL} size="medium" />
      <div className="flex flex-col gap-y-1">
        <div className="text-xs font-semibold flex items-center gap-x-1">
          {user.name}
          <div className="text-rose-500">Banned</div>
        </div>
      </div>
      {isClicked && <Loader className="ml-auto" />}
      {!isClicked && (
        <button
          onClick={() => onUnban(user.id)}
          disabled={isClicked}
          className="text-indigo-500 ml-auto"
        >
          <CheckCircle2 className="h-4 w-4 ml-5" />
          UNBAN
        </button>
      )}
    </div>
  );
}
