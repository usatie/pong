"use client";
// layout
import { updatePassword } from "@/app/lib/actions";
import { Stack } from "@/app/ui/layout/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";

function ErrorText({ text }: { text: string }) {
  return (
    <p aria-live="polite" className="text-sm text-red-500">
      {text}
    </p>
  );
}

function PasswordValidationText({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) {
  if (password.length === 0 || confirmPassword.length === 0) {
    return undefined;
  }
  if (password !== confirmPassword) {
    return ErrorText({
      text: "New Password and Confirm Password does not match.",
    });
  }
  if (password.length < 8) {
    return ErrorText({ text: "Password must be at least 8 characters long." });
  }
  return undefined;
}

function PasswordItem({
  id,
  title,
  placeholder,
  onChange,
}: {
  id: string;
  title: string;
  placeholder: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Stack spacing={1}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {title}
      </Label>
      <Input
        type="password"
        id={id}
        name={id}
        placeholder={placeholder}
        onChange={onChange}
      />
    </Stack>
  );
}

export default function ChangePasswordCard() {
  const [code, action] = useFormState(updatePassword, undefined);
  const { pending } = useFormStatus();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  if (code === "Success") {
    toast({ title: "Success", description: "Password updated successfully." });
  }
  return (
    <form action={action}>
      <Stack spacing={4}>
        <PasswordItem
          id="current-password"
          title="Current Password"
          placeholder="Enter your current password"
        />
        <PasswordItem
          id="new-password"
          title="New Password"
          placeholder="Enter your new password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordItem
          id="confirm-password"
          title="Confirm Password"
          placeholder="Confirm your new password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {PasswordValidationText({ password: newPassword, confirmPassword })}
        {code && code !== "Success" && ErrorText({ text: code })}
        <Button type="submit" aria-disabled={pending}>
          Submit
        </Button>
      </Stack>
    </form>
  );
}
