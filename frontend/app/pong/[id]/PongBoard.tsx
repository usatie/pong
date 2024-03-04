"use client";

import { useAuthContext } from "@/app/lib/client-auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import PongInformationBoard from "./PongInformationBoard";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TARGET_FRAME_MS } from "./const";
import useGame from "@/app/lib/hooks/useGame";

interface PongBoardProps {
  id: string;
}

export default function PongBoard({ id }: PongBoardProps) {
  const { currentUser } = useAuthContext();
  const { resolvedTheme } = useTheme();
  const {
    getGame,
    canvasRef,
    userMode,
    leftPlayer,
    rightPlayer,
    logs,
    start,
    startDisabled,
  } = useGame(id, currentUser, resolvedTheme);

  return (
    <div className="overflow-hidden flex-grow flex gap-8 pb-8">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border flex-grow"
      ></canvas>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={start} disabled={startDisabled}>
            Start
          </Button>
        </div>
        <PongInformationBoard
          logs={logs}
          userMode={userMode}
          leftPlayer={leftPlayer}
          rightPlayer={rightPlayer}
        />
      </div>
    </div>
  );
}
