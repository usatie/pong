"use client";

import SocketProvider from "./lib/client-socket-provider";
import { OnlineContext, useOnlineStatus } from "./lib/hooks/useOnlineStatus";

export function OnlineProviders({ children }: { children: React.ReactNode }) {
  const onlineStatus = useOnlineStatus();
  return (
    <>
      <OnlineContext.Provider value={onlineStatus}>
        {children}
        <SocketProvider />
      </OnlineContext.Provider>
    </>
  );
}
