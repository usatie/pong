"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useContext } from "react";
import { OnlineContext } from "@/app/lib/hooks/useOnlineStatus";

export type AvatarSize = "small" | "medium" | "large";

export interface Props {
  avatarURL?: string;
  size: AvatarSize;
  href?: string;
  alt?: string;
  id?: number;
}

export function Avatar({ avatarURL, size, href, alt, id }: Props) {
  const onlineStatuses = useContext(OnlineContext);
  const online = id ? onlineStatuses[id] : false;
  let sizeClass = "";
  if (!avatarURL) {
    return <Skeleton className={`flex-none rounded-full ${sizeClass}`} />;
  }
  let onlineStatusClass = online ? "bg-green-500 " : "bg-gray-500 ";
  switch (size) {
    case "small":
      sizeClass = "h-6 w-6";
      onlineStatusClass += "w-3 h-3 border-2";
      break;
    case "medium":
      sizeClass = "h-10 w-10";
      onlineStatusClass += "w-4 h-4 border-2";
      break;
    case "large":
      sizeClass = "h-28 w-28";
      onlineStatusClass += "w-8 h-8 border-4";
      break;
    default:
      throw new Error("Invalid size");
  }
  if (!avatarURL) {
    return <Skeleton className={`flex-none rounded-full ${sizeClass}`} />;
  }
  const TooltipWrapper = ({ children }: { children: React.ReactNode }) =>
    alt !== undefined ? (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{alt}</TooltipContent>
      </Tooltip>
    ) : (
      children
    );
  const LinkWrapper = ({ children }: { children: React.ReactNode }) =>
    href !== undefined ? <Link href={href}>{children}</Link> : children;
  return (
    <LinkWrapper>
      <div className={`relative flex-none ${sizeClass}`}>
        <TooltipProvider delayDuration={0}>
          <TooltipWrapper>
            <img
              className={`rounded-full object-cover ${sizeClass}`}
              src={avatarURL}
              alt={alt}
            />
          </TooltipWrapper>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`absolute -bottom-[2px] -right-[2px] border-background rounded-full ${onlineStatusClass}`}
              ></div>
            </TooltipTrigger>
            <TooltipContent sideOffset={-2}>
              {online ? "online" : "offline"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </LinkWrapper>
  );
}
