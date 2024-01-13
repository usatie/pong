"use client";
import { unblockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default function UnblockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => unblockUser(id), undefined);
  return (
    <Button onClick={action} variant={"outline"}>
      Unblock
    </Button>
  );
}
