"use client";
import { blockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useFormState } from "react-dom";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to block user",
  });
};

export default function BlockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => blockUser(id), undefined);
  if (code && code !== "Success") {
    showErrorToast();
  }
  return <Button onClick={action}>Block</Button>;
}
