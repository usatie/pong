"use client";
import { useAuthContext } from "@/app/lib/client-auth";
import { Stack } from "@/app/ui/layout/stack";
import { Button } from "@/components/ui/button";
import AvatarForm from "./avatar-form";
import { ProfileItem } from "./profile-item-form";

export default function ProfileForm() {
  const { currentUser } = useAuthContext();
  // Menu: min 100px
  // Profile : the rest
  return (
    <>
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
    </>
  );
}
