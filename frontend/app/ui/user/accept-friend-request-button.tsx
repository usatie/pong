"use client";
import { acceptFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default async function AcceptFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => acceptFriendRequest(id), undefined);
  return <Button onClick={action}>Confirm</Button>;
}
