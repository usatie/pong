"use client";
import { updateUser } from "@/app/lib/actions";
import { useAuthContext } from "@/app/lib/client-auth";
import { Stack } from "@/components/layout/stack";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useFormState, useFormStatus } from "react-dom";
import AvatarForm from "./avatar-form";
import { ProfileItem } from "./profile-item-form";

function ErrorText({ text }: { text: string }) {
  return (
    <p aria-live="polite" className="text-sm text-red-500">
      {text}
    </p>
  );
}

export default function ProfileForm() {
  const { currentUser } = useAuthContext();
  const [code, action] = useFormState(updateUser, undefined);
  const { pending } = useFormStatus();
  if (code === "Success") {
    toast({ title: "Success", description: "Profile updated sccessfully." });
  }

  // Menu: min 100px
  // Profile : the rest
  return (
    <>
      <AvatarForm avatarURL={currentUser?.avatarURL} id={currentUser?.id} />
      <form action={action}>
        <Stack space="space-y-4">
          <ProfileItem type="text" title="name" value={currentUser?.name} />
          <ProfileItem type="email" title="email" value={currentUser?.email} />
          {code && code !== "Success" && <ErrorText text={code} />}
          <Button
            type="submit"
            aria-disabled={pending}
            variant="outline"
            className="w-40"
          >
            Save
          </Button>
        </Stack>
      </form>
    </>
  );
}
