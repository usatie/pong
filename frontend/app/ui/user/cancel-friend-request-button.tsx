"use client";
import { cancelFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default async function CancelFriendRequestButton({
  id,
}: {
  id: number;
}) {
  const [code, action] = useFormState(() => cancelFriendRequest(id), undefined);
  return (
    <Button onClick={action} variant={"outline"}>
      Cancel Friend Request
    </Button>
  );
}
