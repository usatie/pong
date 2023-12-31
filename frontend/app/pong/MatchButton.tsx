"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function MatchButton() {
  const router = useRouter();
  const [socket] = useState(() =>
    io("/pong", { autoConnect: false, forceNew: true }),
  );
  const [message, setMessage] = useState("Match with someone!");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log(`Connected: ${socket.id}`);
    };
    const handleMatched = (roomId: string) => {
      setMessage("Matched!");
      router.push(`/pong/${roomId}?mode=player`);
    };

    socket.on("connect", handleConnect);
    socket.on("matched", handleMatched);
    socket.connect();

    return () => {
      socket.disconnect();
      socket.off("connect", handleConnect);
      socket.off("matched", handleMatched);
    };
  }, [socket, router]);

  const requestMatching = () => {
    socket.emit("request");
    setDisabled(true);
    setMessage("Waiting for someone to match with...");
  };
  return (
    <Button onClick={requestMatching} disabled={disabled}>
      {message}
    </Button>
  );
}
