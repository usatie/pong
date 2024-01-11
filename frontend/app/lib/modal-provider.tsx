"use client";

import { BanModal } from "@/app/ui/room/ban-modal";
import { SettingModal } from "@/app/ui/room/setting-modal";
import { InviteModal } from "@/app/ui/room/invite-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <InviteModal />
      <SettingModal />
      <BanModal />
    </>
  );
};
