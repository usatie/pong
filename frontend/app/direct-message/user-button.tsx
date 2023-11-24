"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/app/ui/user/card";

export const UserButton = ({ user }: { user: User }) => {
  const router = useRouter();

  const handleOnClick = () => {
    router.push(`/direct-message/${user.id}`);
  };

  return <button onClick={handleOnClick}>{user.name}</button>;
};
