"use client";

import { useOnlineStatus } from "./lib/hooks/useOnlineStatus";
import SocketProvider, { OnlineContext } from "./lib/client-socket-provider";
import Nav from "./ui/nav";

export function OnlineProviders({ children }: { children: React.ReactNode }) {
  const { onlineStatus, setOnlineStatus } = useOnlineStatus();
  return (
    <>
      <OnlineContext.Provider value={onlineStatus}>
        <div className="flex flex-col px-16 h-[100vh]">
          <Nav />
          {children}
        </div>
        <SocketProvider setOnlineStatus={setOnlineStatus} />
      </OnlineContext.Provider>
    </>
  );
}
