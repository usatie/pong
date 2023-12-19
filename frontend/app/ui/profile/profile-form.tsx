"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stack } from "@/app/ui/layout/stack";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/app/lib/client-auth";
import { useRef } from "react";
import { uploadAvatar } from "@/app/lib/actions";

function ProfileItem({ type, title, value }: ProfileItemProps) {
  return (
    <Stack spacing={1} className="w-96">
      <Label htmlFor={title} className="text-xs text-muted-foreground">
        {title}
      </Label>
      <Input type={type} id={title} name={title} defaultValue={value} />
    </Stack>
  );
}

export type ProfileItemProps = {
  type: string;
  title: string;
  value?: string;
};

function Avatar({ avatarURL }: { avatarURL?: string }) {
  if (avatarURL) {
    return (
      <img
        src={avatarURL}
        className="rounded-full w-20 h-20 object-cover"
        alt="Avatar"
      />
    );
  } else {
    return <Skeleton className="rounded-full h-20 w-20" />;
  }
}

function AvatarForm({ avatarURL }: { avatarURL?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const submitAvatarForm = () => {
    const form = document.getElementById("avatar-form") as HTMLFormElement;
    form.requestSubmit();
  };
  return (
    <form id="avatar-form" action={uploadAvatar}>
      <button type="button" onClick={() => inputRef.current?.click()}>
        <Avatar avatarURL={avatarURL} />
      </button>
      <input
        ref={inputRef}
        accept="image/*"
        name="avatar"
        hidden
        type="file"
        onChange={submitAvatarForm}
      />
    </form>
  );
}

export default function ProfileForm() {
  const { currentUser } = useAuthContext();
  // Menu: min 100px
  // Profile : the rest
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <div className="text-2xl">Profile</div>
        <Separator />
      </Stack>
      <AvatarForm avatarURL={currentUser?.avatarURL} />
      <form>
        <Stack spacing={4}>
          <ProfileItem type="text" title="name" value={currentUser?.name} />
          <ProfileItem type="email" title="email" value={currentUser?.email} />
          <div></div>
          <Button variant="outline" className="w-40">
            Save
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
