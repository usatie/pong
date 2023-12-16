"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stack } from "@/app/ui/layout/stack";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/lib/auth";

function AvatarSkeleton() {
  return <Skeleton className="rounded-full h-20 w-20" />;
}

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

export default function ProfileForm() {
  const { currentUser } = useAuth();
  // Menu: min 100px
  // Profile : the rest
  return (
    <form>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <div className="text-2xl">Profile</div>
          <Separator />
        </Stack>
        <AvatarSkeleton />
        <ProfileItem type="text" title="name" value={currentUser?.name} />
        <ProfileItem type="email" title="email" value={currentUser?.email} />
        <div></div>
        <Button variant="outline" className="w-40">
          Save
        </Button>
      </Stack>
    </form>
  );
}
