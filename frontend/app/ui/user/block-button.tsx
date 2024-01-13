"use client";
import { blockUser } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";

export default function BlockButton({ id }: { id: number }) {
  const [code, action] = useFormState(() => blockUser(id), undefined);
  return <Button onClick={action}>Block</Button>;
}
