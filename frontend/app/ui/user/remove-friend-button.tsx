"use client";
import { unfriend } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useFormState } from "react-dom";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "Failed to remove friend",
  });
};

export default function RemoveFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unfriend(id), undefined);
  if (code && code !== "Success") {
    showErrorToast();
  }
  return (
    <Button onClick={action} variant={"outline"}>
      Remove Friend
    </Button>
  );
}
