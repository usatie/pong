import { useCallback, useState } from "react";
import { UserMode } from "./useUserMode";
import { PublicUserEntity, UserEntity } from "../dtos";

export default function usePlayers(
  userMode: UserMode,
  currentUser?: UserEntity,
) {
  const [leftPlayer, setLeftPlayer] = useState<PublicUserEntity | undefined>(
    () => (userMode === "player" ? currentUser : undefined),
  );
  const [rightPlayer, setRightPlayer] = useState<PublicUserEntity | undefined>(
    undefined,
  );

  const getPlayerSetterFromPlayerNumber = useCallback(
    (playerNumber: number) => {
      return userMode == "player"
        ? setRightPlayer
        : playerNumber == 1
          ? setLeftPlayer
          : setRightPlayer;
    },
    [userMode],
  );

  return {
    leftPlayer,
    rightPlayer,
    getPlayerSetterFromPlayerNumber,
  };
}
