"use client";
import { cancelFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: (
      <>
        Failed to cancel friend request.
        <br />
        Please reload the page and try again.
      </>
    ),
  });
};

export default function CancelFriendRequestButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => cancelFriendRequest(id), undefined);
  if (code && code !== "Success") {
    showErrorToast();
  }
  return (
    <Button onClick={action} variant={"outline"}>
      Cancel Friend Request
    </Button>
  );
}
