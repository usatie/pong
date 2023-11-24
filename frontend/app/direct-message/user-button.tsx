"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { User } from "@/app/ui/user/card";

export const UserButton = ({ user }: { user: User }) => {
  const router = useRouter();

  const handleOnClick = () => {
    router.push(`/direct-message/${user.id}`);
  };

  return (
    <button
      onClick={handleOnClick}
      className="hover:text-black dark:hover:text-white text-slate-500 text-muted-foreground"
    >
      {user.name}
    </button>
  );
};
