"use client";
import { cancelFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "An error occurred while canceling the friend request",
  });
};

export default function CancelFriendRequestButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => cancelFriendRequest(id), undefined);
  return (
    <>
      <Button onClick={action} variant={"outline"}>
        Cancel Friend Request
      </Button>
      {code && code !== "Success" && showErrorToast()}
    </>
  );
}
