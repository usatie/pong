"use client";
import { unfriend } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default async function RemoveFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unfriend(id), undefined);
  return (
    <Button onClick={action} variant={"outline"}>
      Remove Friend
    </Button>
  );
}
