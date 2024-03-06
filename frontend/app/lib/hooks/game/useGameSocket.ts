import { PongGame } from "@/app/pong/[id]/PongGame";
import { useCallback, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { UserMode } from "../useUserMode";
import { UserEntity } from "../../dtos";
import { POINT_TO_WIN } from "@/app/pong/[id]/const";
import { useToast } from "@/components/ui/use-toast";

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
  | "finish"
  | "game-already-started";

interface HandleActionProps {
  playerNumber: number;
}

const getLogFromStatus = (status: Status): string => {
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
    case "game-already-started":
      return "The game is already started. Wait for the next round";
  }
};

export default function useGameSocket(
  id: string,
  getGame: () => PongGame,
  setLogs: (fun: (logs: string[]) => string[]) => void,
  userMode: UserMode,
  setUserMode: (mode: UserMode) => void,
  getPlayerSetterFromPlayerNumber: (
    playerNumber: number,
  ) => (user: any) => void,
  setStartDisabled: (disabled: boolean) => void,
  currentUser?: UserEntity,
) {
  const socketRef = useRef<Socket | null>(null); // updated on `id` change
  const { toast } = useToast();

  const start = useCallback(() => {
    if (!userMode) return;
    const game = getGame();

    setStartDisabled(true);

    const { vx, vy } = game.start({ vx: undefined, vy: undefined });
    socketRef.current?.emit("start", {
      vx: -vx,
      vy: -vy,
    });
  }, [getGame, userMode, setStartDisabled]);

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
          {
            const { playerNumber, user } = payload;
            const setter = getPlayerSetterFromPlayerNumber(playerNumber);
            setter(user);
            currentUser && setStartDisabled(false);
            game.resetPlayerPosition();
            game.reset();
          }
          break;
        case "friend-left":
          {
            const { playerNumber } = payload;
            const setter = getPlayerSetterFromPlayerNumber(playerNumber);
            setter(undefined);
            setStartDisabled(true);
            const game = getGame();
            game.reset();
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
    [
      currentUser,
      setUserMode,
      getGame,
      getPlayerSetterFromPlayerNumber,
      setStartDisabled,
    ],
  );

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
      toast({
        title: "Game Log",
        description: log,
      });
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

    const handleDown = ({ playerNumber }: HandleActionProps) => {
      if (userMode !== "player" && playerNumber == 1) {
        game.movePlayer1Down();
      } else {
        game.movePlayer2Up();
      }
    };

    const handleUp = ({ playerNumber }: HandleActionProps) => {
      if (userMode !== "player" && playerNumber == 1) {
        game.movePlayer1Up();
      } else {
        game.movePlayer2Down();
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
      game.reset();
    };

    socket.on("connect", handleConnect);
    socket.on("start", handleStart);
    socket.on("down", handleDown);
    socket.on("up", handleUp);
    socket.on("bounce", handleBounce);
    socket.on("collide", handleCollide);
    socket.on("update-status", handleUpdateStatus);
    socket.on("finish", handleFinish);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("start", handleStart);
      socket.off("down", handleDown);
      socket.off("up", handleUp);
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
    setStartDisabled,
  ]);

  return { socketRef, start };
}
