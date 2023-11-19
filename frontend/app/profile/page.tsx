import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stack } from "@/app/ui/layout/stack";

function AvatarSkeleton() {
  return <Skeleton className="rounded-full h-20 w-20 " />;
}

function ProfileItem({ title, value }) {
  return (
    <Stack spacing={1} className="flex-initial w-96">
      <div className="text-xs text-muted-foreground">{title}: </div>
      <Input defaultValue={value} />
    </Stack>
  );
}

export default function ProfilePage() {
  // Menu: min 100px
  // Profile : the rest
  return (
    <>
      <main>
        <form>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <div className="text-2xl">Profile</div>
              <Separator />
            </Stack>
            <AvatarSkeleton />
            <ProfileItem
              title="username"
              value="susami"
              className="flex-initial w-80"
            />
            <ProfileItem title="email" value="susami@example.com" />
            <Button variant="secondary" className="flex-initial w-40">
              Save
            </Button>
          </Stack>
        </form>
      </main>
    </>
  );
}
