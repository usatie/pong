"use client";
import { blockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const showErrorToast = () => {
  toast({
    title: "Error",
    description: "failed to block user",
  });
};

export default function BlockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => blockUser(id), undefined);
  return (
    <>
      <Button onClick={action}>Block</Button>
      {code && code !== "Success" && showErrorToast()}
    </>
  );
}
