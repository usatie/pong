"use client";
import { unfriend } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useFormState } from "react-dom";

export default function RemoveFriendButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unfriend(id), undefined);
  useEffect(() => {
    const showErrorToast = () => {
      toast({
        title: "Error",
        description: "Failed to remove friend",
      });
    };
    if (code && code !== "Success") {
      showErrorToast();
    }
  }, [code]);
  return (
    <Button onClick={action} variant={"outline"}>
      Remove Friend
    </Button>
  );
}
