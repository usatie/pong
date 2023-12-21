"use client";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default async function MatchRequestButton({ id }: { id: number }) {
  // TODO: Implement this
  const [code, action] = useFormState(
    () => console.log("Match Request to ", id),
    undefined,
  );
  return <Button onClick={action}>Request Match</Button>;
}
