"use client";
import { addFriend } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useFormState } from "react-dom";

export default function AddFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => addFriend(id), undefined);
  useEffect(() => {
    const showErrorToast = () => {
      toast({
        title: "Error",
        description: "Failed to send friend request",
      });
    };
    if (code && code !== "Success") {
      showErrorToast();
    }
  }, [code]);
  return <Button onClick={action}>Add Friend</Button>;
}
