"use client";

import { PublicUserEntity } from "@/app/lib/dtos";
import { GameCard } from "@/app/ui/pong/GameCard";

interface PongInformationBoardProps {
  logs: string[];
  userMode: "viewer" | "player";
  leftPlayer?: PublicUserEntity;
  rightPlayer?: PublicUserEntity;
}

export default function PongInformationBoard({
  logs,
  userMode,
  leftPlayer,
  rightPlayer,
}: PongInformationBoardProps) {
  return (
    <div className="overflow-hidden flex-grow flex flex-col gap-1">
      <GameCard leftPlayer={leftPlayer} rightPlayer={rightPlayer}></GameCard>
      <div>You are a {userMode}</div>
      <div
        id="logs"
        className="flex-grow overflow-y-auto flex flex-col gap-0 border border-spacing-1 p-1"
      >
        <div>logs: </div>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
}
