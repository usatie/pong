"use client";

import { OnlineContext, useOnlineStatus } from "./lib/hooks/useOnlineStatus";
import SocketProvider from "./lib/client-socket-provider";

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
