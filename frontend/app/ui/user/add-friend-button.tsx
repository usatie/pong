"use client";
import { addFriend } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "Failed to send friend request",
  });
};

export default function AddFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => addFriend(id), undefined);
  if (code && code !== "Success") {
    showErrorToast();
  }
  return <Button onClick={action}>Add Friend</Button>;
}
