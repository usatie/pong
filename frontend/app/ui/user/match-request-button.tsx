"use client";
import { useRequestMatch } from "@/app/lib/hooks/useRequestMatch";
import { Button } from "@/components/ui/button";

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
