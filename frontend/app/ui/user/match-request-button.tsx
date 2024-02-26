"use client";
import { Button } from "@/components/ui/button";
import { useRequestMatch } from "@/app/lib/hooks/useRequestMatch";

export default function MatchRequestButton({ id }: { id: number }) {
  // TODO: Implement this
  const {
    sendRequestPending,
    isRequestingMatch,
    requestMatch,
    cancelRequestMatch,
  } = useRequestMatch(id);

  return isRequestingMatch ? (
    <Button onClick={cancelRequestMatch} disabled={sendRequestPending}>
      Cancel Request
    </Button>
  ) : (
    <Button onClick={requestMatch} disabled={sendRequestPending}>
      Request Match
    </Button>
  );
}
