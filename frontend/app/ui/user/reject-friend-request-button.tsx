"use client";
import { rejectFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useFormState } from "react-dom";

export default function RejectFriendRequestButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => rejectFriendRequest(id), undefined);
  useEffect(() => {
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
    if (code && code !== "Success") {
      showErrorToast();
    }
  }, [code]);
  return (
    <Button onClick={action} variant={"outline"}>
      Delete Request
    </Button>
  );
}
