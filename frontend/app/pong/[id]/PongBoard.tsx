"use client";

import { useAuthContext } from "@/app/lib/client-auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import PongInformationBoard from "./PongInformationBoard";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TARGET_FRAME_MS } from "./const";
import useGame from "@/app/lib/hooks/useGame";

type Status =
  | "too-many-players"
  | "joined-as-player"
  | "joined-as-viewer"
  | "ready"
  | "login-required"
  | "friend-joined"
  | "friend-left"
  | "won"
  | "lost"
  | "finish";

interface PongBoardProps {
  id: string;
}

interface HandleActionProps {
  playerNumber: number;
}

const POINT_TO_WIN = 3;

const getLogFromStatus = (status: Status) => {
  switch (status) {
    case "too-many-players":
      return "There are too many players. You can only watch the game";
    case "joined-as-player":
      return "You have joined as player";
    case "joined-as-viewer":
      return "You have joined as viewer";
    case "ready":
      return "Your friend is already here. The game is ready to start";
    case "login-required":
      return "You need to login to play.";
    case "friend-joined":
      return "Your friend has joined the game";
    case "friend-left":
      return "Your friend has left";
    case "won":
      return "You won!";
    case "lost":
      return "You lost!";
    case "finish":
      return "The game has finished";
  }
};

function PongBoard({ id }: PongBoardProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const { currentUser } = useAuthContext();
  const {
    getGame,
    canvasRef,
    userMode,
    setUserMode,
    leftPlayer,
    rightPlayer,
    getPlayerSetterFromPlayerNumber,
  } = useGame(currentUser);
  const socketRef = useRef<Socket | null>(null); // updated on `id` change
  const [startDisabled, setStartDisabled] = useState(true);
  const { resolvedTheme } = useTheme();

  const start = useCallback(() => {
    if (!userMode) return;
    const game = getGame();

    setStartDisabled(true);

    const { vx, vy } = game.start({ vx: undefined, vy: undefined });
    socketRef.current?.emit("start", {
      vx: -vx,
      vy: -vy,
    });
  }, [getGame, userMode]);

  const runSideEffectForStatusUpdate = useCallback(
    (status: Status, payload: any) => {
      const game = getGame();

      switch (status) {
        case "too-many-players":
          // TODO: users cannot really see the log
          setUserMode("viewer");
          break;
        case "login-required":
          // TODO: instead of redirect. Show modal to login
          setUserMode("viewer");
          break;
        case "friend-joined":
          const { playerNumber, user } = payload;
          const setter = getPlayerSetterFromPlayerNumber(playerNumber);
          setter(user);
          currentUser && setStartDisabled(false);
          game.resetPlayerPosition();
          break;
        case "friend-left":
          {
            const { playerNumber } = payload;
            const setter = getPlayerSetterFromPlayerNumber(playerNumber);
            setter(undefined);
            setStartDisabled(true);
          }
          break;
        case "joined-as-viewer":
          {
            const { players } = payload;
            players.forEach(({ playerNumber, user }: any) => {
              const setter = getPlayerSetterFromPlayerNumber(playerNumber);
              setter(user);
            });
          }
          break;
        case "ready": {
          {
            const { user, playerNumber } = payload;
            const setter = getPlayerSetterFromPlayerNumber(playerNumber);
            setter(user);
          }
          break;
        }
      }
    },
    [currentUser, setUserMode, getGame, getPlayerSetterFromPlayerNumber],
  );

  useEffect(() => {
    // TODO: Use --foreground color from CSS
    // Somehow it didn't work (theme is changed but not yet committed to CSS/DOM?)
    const game = getGame();
    const color =
      resolvedTheme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)";
    game.setColor(color);
    game.draw_canvas();
  }, [resolvedTheme, getGame]);

  useEffect(() => {
    const game = getGame();
    game.draw_canvas();
    const intervalId = setInterval(game.update, TARGET_FRAME_MS);

    return () => clearInterval(intervalId);
  }, [getGame]);

  useEffect(() => {
    const game = getGame();

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key == "ArrowDown" || event.key == "ArrowUp") {
        game.setMovingDirection("none");
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "ArrowDown") {
        game.setMovingDirection("right");
      } else if (event.key == "ArrowUp") {
        game.setMovingDirection("left");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [getGame]);

  useEffect(() => {
    const socket = io("/pong", {
      query: { game_id: id, is_player: userMode === "player" },
      forceNew: true,
    });
    socketRef.current = socket;

    const game = getGame();
    game.onAction = (action: string) => {
      socket.emit(action);
    };

    const handleUpdateStatus = ({
      status,
      payload,
    }: {
      status: Status;
      payload: any;
    }) => {
      runSideEffectForStatusUpdate(status, payload);
      const log = getLogFromStatus(status);
      setLogs((logs) => [...logs, log]);
    };
    const handleConnect = () => {
      console.log(`Connected: ${socketRef.current?.id}`);
      const log = "Connected to server";
      setLogs((logs) => [...logs, log]);
    };

    const handleStart = (data: { vx: number; vy: number }) => {
      game.start(data);
      setStartDisabled(true);
    };

    const handleRight = ({ playerNumber }: HandleActionProps) => {
      if (userMode !== "player" && playerNumber == 1) {
        game.movePlayer1Left();
      } else {
        game.movePlayer2Left();
      }
    };

    const handleLeft = ({ playerNumber }: HandleActionProps) => {
      if (userMode !== "player" && playerNumber == 1) {
        game.movePlayer1Right();
      } else {
        game.movePlayer2Right();
      }
    };

    const handleBounce = ({ playerNumber }: HandleActionProps) => {
      if (userMode !== "player" && playerNumber == 1) {
        game.bounceOffPaddlePlayer1();
      } else {
        game.bounceOffPaddlePlayer2();
      }
    };

    const handleCollide = (msg: HandleActionProps) => {
      const { playerNumber } = msg;
      if (userMode === "player") {
        const score = game.increaseScorePlayer1();
        if (score != POINT_TO_WIN) {
          setTimeout(() => start(), 1000);
        }
      } else {
        if (playerNumber == 1) {
          game.increaseScorePlayer2();
        } else {
          game.increaseScorePlayer1();
        }
      }
      game.endRound();
    };

    const handleFinish = () => {
      const game = getGame();
      game.stop();
    };

    socket.on("connect", handleConnect);
    socket.on("start", handleStart);
    socket.on("right", handleRight);
    socket.on("left", handleLeft);
    socket.on("bounce", handleBounce);
    socket.on("collide", handleCollide);
    socket.on("update-status", handleUpdateStatus);
    socket.on("finish", handleFinish);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("start", handleStart);
      socket.off("right", handleRight);
      socket.off("left", handleLeft);
      socket.off("bounce", handleBounce);
      socket.off("collide", handleCollide);
      socket.off("update-status", handleUpdateStatus);
      socket.off("finish", handleFinish);
      socket.disconnect();
    };
  }, [
    id,
    getGame,
    setLogs,
    start,
    userMode,
    setUserMode,
    runSideEffectForStatusUpdate,
  ]);

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

const memoizedPongBoard = memo(PongBoard);
export default memoizedPongBoard;
// export default PongBoard;
