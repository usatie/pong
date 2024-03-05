"use client";
import { blockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useFormState } from "react-dom";

export default function BlockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => blockUser(id), undefined);
  useEffect(() => {
    const showErrorToast = () => {
      toast({
        title: "Error",
        description: "failed to block user",
      });
    };
    if (code && code !== "Success") {
      showErrorToast();
    }
  }, [code]);
  return <Button onClick={action}>Block</Button>;
}
