"use client";
import { unblockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useFormState } from "react-dom";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to unblock user",
  });
};

export default function UnblockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unblockUser(id), undefined);
  if (code && code !== "Success") {
    showErrorToast();
  }
  return (
    <Button onClick={action} variant={"outline"}>
      Unblock
    </Button>
  );
}
