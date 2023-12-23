import { uploadAvatar } from "@/app/lib/actions";
import { Avatar } from "@/app/ui/user/avatar";
import { useRef } from "react";

export default function AvatarForm({ avatarURL }: { avatarURL?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const submitAvatarForm = () => {
    const form = document.getElementById("avatar-form") as HTMLFormElement;
    form.requestSubmit();
  };
  return (
    <form id="avatar-form" action={uploadAvatar}>
      <button type="button" onClick={() => inputRef.current?.click()}>
        <Avatar avatarURL={avatarURL} size="large" />
      </button>
      <input
        ref={inputRef}
        accept="image/*"
        aria-label="Change Avatar"
        name="avatar"
        hidden
        type="file"
        onChange={submitAvatarForm}
      />
    </form>
  );
}
