"use client";

import { useState } from "react";

export function useOnlineStatus() {
  const [onlineStatus, setOnlineStatus] = useState<{ [key: number]: number }>(
    {}
  );
  return { onlineStatus, setOnlineStatus };
}
