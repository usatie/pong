import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type UserMode = "viewer" | "player";

export function useUserMode(): [UserMode, (mode: UserMode) => void] {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const userMode = searchParams.get("mode") == "player" ? "player" : "viewer";

  const setUserMode = useCallback(
    (mode: UserMode) => {
      const params = new URLSearchParams(searchParams);
      params.set("mode", mode);
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace],
  );

  return [userMode, setUserMode];
}
