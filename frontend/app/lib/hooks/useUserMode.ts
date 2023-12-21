import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type UserModeType = "viewer" | "player";

export function useUserMode(): [UserModeType, (mode: UserModeType) => void] {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const userMode = searchParams.get("mode") == "player" ? "player" : "viewer";

  const setUserMode = useCallback(
    (mode: UserModeType) => {
      const params = new URLSearchParams(searchParams);
      params.set("mode", mode);
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace],
  );

  return [userMode, setUserMode];
}
