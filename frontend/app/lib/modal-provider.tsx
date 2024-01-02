"use client";

import { useEffect, useState } from "react";
import { BanModal } from "@/app/ui/room/ban-modal";

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
      <BanModal />
    </>
  );
};
