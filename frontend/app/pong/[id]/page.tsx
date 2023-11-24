"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import PongInformationBoard from "./PongInformationBoard";
import PongBoard from "./PongBoard";

export default function Page({ params: { id } }: { params: { id: string } }) {
  const [fps, setFps] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [player1Position, setPlayer1Position] = useState<number>(0);
  const [player2Position, setPlayer2Position] = useState<number>(0);

  const memoizedSetFps = useCallback((fps: number) => setFps(fps), []);
  const memoizedSetSpeed = useCallback((speed: number) => setSpeed(speed), []);
  const memoizedSetPlayer1Position = useCallback(
    (player1Position: number) => setPlayer1Position(player1Position),
    [],
  );
  const memoizedSetPlayer2Position = useCallback(
    (player2Position: number) => setPlayer2Position(player2Position),
    [],
  );

  return (
    <>
      <PongInformationBoard
        fps={fps}
        speed={speed}
        player1Position={player1Position}
        player2Position={player2Position}
      />
      <PongBoard
        id={id}
        setFps={memoizedSetFps}
        setSpeed={memoizedSetSpeed}
        setPlayer1Position={memoizedSetPlayer1Position}
        setPlayer2Position={memoizedSetPlayer2Position}
      />
    </>
  );
}
