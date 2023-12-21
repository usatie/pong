"use client";
import { addFriend } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default async function AddFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => addFriend(id), undefined);
  return <Button onClick={action}>Add Friend</Button>;
}
