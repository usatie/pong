"use client";
import { rejectFriendRequest } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "An error occurred while rejecting the friend request",
  });
};

export default function RejectFriendRequestButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => rejectFriendRequest(id), undefined);
  return (
    <>
      <Button onClick={action} variant={"outline"}>
        Delete Request
      </Button>
      {code && code !== "Success" && showErrorToast()}
    </>
  );
}
