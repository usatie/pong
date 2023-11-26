"use client";

interface PongInformationBoardProps {
  fps: number;
  speed: number;
  player1Position: number;
  player2Position: number;
  logs: string[];
}

export default function PongInformationBoard({
  fps,
  speed,
  player1Position,
  player2Position,
  logs,
}: PongInformationBoardProps) {
  return (
    <div className="flex flex-col gap-1">
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
        className="flex flex-col gap-0 border border-spacing-1 p-1"
      >
        <div>logs: </div>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
