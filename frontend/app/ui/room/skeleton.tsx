import { Skeleton } from "@/components/ui/skeleton";

export function Avatar({ avatarURL }: { avatarURL?: string }) {
  if (!avatarURL) {
    return <AvatarSkeleton />;
  }
  return (
    <img
      className="flex-none rounded-full h-10 w-10 object-cover"
      src={avatarURL}
      alt="avatar"
    />
  );
}
export function AvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-10 w-10" />;
}

export function SmallAvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-6 w-6" />;
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-4">
      <AvatarSkeleton />
      <div className="flex-grow flex flex-col justify-between">
        <Skeleton className="max-w-md h-1/3" />
        <Skeleton className="max-w-lg h-1/2" />
      </div>
    </div>
  );
}
