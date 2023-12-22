import { Skeleton } from "@/components/ui/skeleton";

export function Avatar({
  avatarURL,
  size,
  alt,
}: {
  avatarURL?: string;
  size: "small" | "medium" | "large";
  alt?: string;
}) {
  let sizeClass = "";
  switch (size) {
    case "small":
      sizeClass = "h-6 w-6";
      break;
    case "medium":
      sizeClass = "h-10 w-10";
      break;
    case "large":
      sizeClass = "h-32 w-32";
      break;
    default:
      sizeClass = "h-10 w-10";
      break;
  }
  if (!avatarURL) {
    return <Skeleton className={`flex-none rounded-full ${sizeClass}`} />;
  } else {
    return (
      <img
        className={`flex-none rounded-full object-cover ${sizeClass}`}
        src={avatarURL}
        alt={alt}
      />
    );
  }
}
