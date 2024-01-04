"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoRefresh } from "react-icons/io5";
import { io } from "socket.io-client";
import { GameCard } from "./GameCard";

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
        <CardHeader>
          <CardTitle>Ongoing games</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button variant="ghost" onClick={requestListingGames}>
            <IoRefresh />
          </Button>
          {games.length === 0 ? (
            <p>No ongoing games</p>
          ) : (
            games.map((game: any, index: number) => (
              <GameCard
                key={game.roomId}
                roomId={game.roomId}
                players={game.players}
              />
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
