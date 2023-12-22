"use client";
import { Stack } from "@/app/ui/layout/stack";
import { SidebarNav } from "@/app/ui/settings/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Change Password",
    href: "/settings/change-password",
  },
  {
    title: "Account",
    href: "/settings/account",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
  },
  {
    title: "Configure 2FA",
    href: "/settings/2fa",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const title = sidebarNavItems.find((item) => item.href === pathname)?.title;
  return (
    <>
      <div className="pb-16">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            <Stack spacing={4}>
              <Stack spacing={1}>
                <div className="text-2xl">{title}</div>
                <Separator />
              </Stack>
              {children}
            </Stack>
          </div>
        </div>
      </div>
    </>
  );
}
