"use client";
import { unblockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to unblock user",
  });
};

export default function UnblockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unblockUser(id), undefined);
  return (
    <>
      <Button onClick={action} variant={"outline"}>
        Unblock
      </Button>
      {code && code !== "Success" && showErrorToast()}
    </>
  );
}
