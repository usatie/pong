"use client";
import { rejectFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useFormState } from "react-dom";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: (
      <>
        Failed to delete friend request.
        <br />
        Please reload the page and try again.
      </>
    ),
  });
};

export default function RejectFriendRequestButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => rejectFriendRequest(id), undefined);
  if (code && code !== "Success") {
    showErrorToast();
  }
  return (
    <Button onClick={action} variant={"outline"}>
      Delete Request
    </Button>
  );
}
