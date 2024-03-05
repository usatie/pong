"use client";
import { unblockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useFormState } from "react-dom";

export default function UnblockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unblockUser(id), undefined);
  useEffect(() => {
    const showErrorToast = () => {
      toast({
        title: "Error",
        description: "failed to unblock user",
      });
    };
    if (code && code !== "Success") {
      showErrorToast();
    }
  }, [code]);
  return (
    <Button onClick={action} variant={"outline"}>
      Unblock
    </Button>
  );
}
