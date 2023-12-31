"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { GameCard } from "./GameCard";
import { IoRefresh } from "react-icons/io5";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function GameList() {
  const socket = useMemo(() => io("/pong", { forceNew: true }), []);

  const [games, setGames] = useState([]);
  const { toast } = useToast();

  const requestListingGames = useCallback(() => {
    socket.emit("list-games", (games: any) => {
      setGames(games);
      toast({
        title: "List games",
        description: "Successfully listed current ongoing games",
      });
    });
  }, [socket, toast]);

  useEffect(() => {
    requestListingGames();
  }, [requestListingGames]);

  return (
    <>
      <Card className="flex flex-col items-center">
        <Button variant="ghost" onClick={requestListingGames}>
          <IoRefresh />
        </Button>

        {games.map((game: any, index: number) => (
          <GameCard key={game.roomId} roomId={index} players={game.players} />
        ))}
      </Card>
    </>
  );
}
