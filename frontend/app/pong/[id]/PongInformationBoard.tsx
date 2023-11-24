"use client";

interface PongInformationBoardProps {
  fps: number;
  speed: number;
  player1Position: number;
  player2Position: number;
}

export default function PongInformationBoard({
  fps,
  speed,
  player1Position,
  player2Position,
}: PongInformationBoardProps) {
  return (
    <div className="flex flex-col">
      <div id="fps">FPS: {fps}</div>
      <div id="speed">Speed: {speed}</div>
      <div>
        player1: <span id="player1">{player1Position}</span>
      </div>
      <div>
        player2: <span id="player2">{player2Position}</span>
      </div>
    </div>
  );
}
