"use client";
import { acceptFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "An error occurred while accepting the friend request",
  });
};

export default function AcceptFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => acceptFriendRequest(id), undefined);
  return (
    <>
      <Button onClick={action}>Confirm</Button>
      {code && code !== "Success" && showErrorToast()}
    </>
  );
}
