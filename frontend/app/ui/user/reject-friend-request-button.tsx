"use client";
import { rejectFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default async function RejectFriendRequestButton({
  id,
}: {
  id: number;
}) {
  const [code, action] = useFormState(() => rejectFriendRequest(id), undefined);
  return (
    <Button onClick={action} variant={"outline"}>
      Delete Request
    </Button>
  );
}
