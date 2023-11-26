"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import PongInformationBoard from "./PongInformationBoard";
import PongBoard from "./PongBoard";

type setState<T> = T | ((prevState: T) => T);

function useStateCallback<T>(
  initialState: T | (() => T),
): [T, (arg: setState<T>) => void] {
  const [state, setState] = useState<T>(initialState);
  const memoizedSetFunction = useCallback(
    (arg: setState<T>) => setState(arg),
    [],
  );

  return [state, memoizedSetFunction];
}

export default function Page({ params: { id } }: { params: { id: string } }) {
  const [fps, setFps] = useStateCallback<number>(0);
  const [speed, setSpeed] = useStateCallback<number>(0);
  const [player1Position, setPlayer1Position] = useStateCallback<number>(0);
  const [player2Position, setPlayer2Position] = useStateCallback<number>(0);
  const [logs, setLogs] = useStateCallback<string[]>([]);

  return (
    <>
      <PongBoard
        id={id}
        setFps={setFps}
        setSpeed={setSpeed}
        setPlayer1Position={setPlayer1Position}
        setPlayer2Position={setPlayer2Position}
        setLogs={setLogs}
      />
      <PongInformationBoard
        fps={fps}
        speed={speed}
        player1Position={player1Position}
        player2Position={player2Position}
        logs={logs}
      />
    </>
  );
}
