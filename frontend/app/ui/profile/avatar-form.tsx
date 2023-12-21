import { uploadAvatar } from "@/app/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef } from "react";

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

export default function AvatarForm({ avatarURL }: { avatarURL?: string }) {
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
        aria-label="Change Avatar"
        name="avatar"
        hidden
        type="file"
        onChange={submitAvatarForm}
      />
    </form>
  );
}
