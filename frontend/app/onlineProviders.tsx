"use client";

import { useOnlineStatus } from "./lib/hooks/useOnlineStatus";
import SocketProvider, { OnlineContext } from "./lib/client-socket-provider";

export function OnlineProviders({ children }: { children: React.ReactNode }) {
  const { onlineStatus, setOnlineStatus } = useOnlineStatus();
  return (
    <>
      <OnlineContext.Provider value={onlineStatus}>
        {children}
        <SocketProvider setOnlineStatus={setOnlineStatus} />
      </OnlineContext.Provider>
    </>
  );
}
