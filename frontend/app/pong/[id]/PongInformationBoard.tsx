"use client";

import { PublicUserEntity } from "@/app/lib/dtos";
import { GameCard } from "@/app/ui/pong/GameCard";

interface PongInformationBoardProps {
  fps: number;
  speed: number;
  player1Position: number;
  player2Position: number;
  logs: string[];
  userMode: "viewer" | "player";
  leftPlayer?: PublicUserEntity;
  rightPlayer?: PublicUserEntity;
}

export default function PongInformationBoard({
  fps,
  speed,
  player1Position,
  player2Position,
  logs,
  userMode,
  leftPlayer,
  rightPlayer,
}: PongInformationBoardProps) {
  return (
    <div className="overflow-hidden flex-grow flex flex-col gap-1">
      <GameCard leftPlayer={leftPlayer} rightPlayer={rightPlayer}></GameCard>
      <div>You are a {userMode}</div>
      <div id="fps">FPS: {fps}</div>
      <div id="speed">Speed: {speed}</div>
      <div>
        player1: <span id="player1">{player1Position}</span>
      </div>
      <div>
        player2: <span id="player2">{player2Position}</span>
      </div>
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
