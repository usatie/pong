import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/app/lib/auth";
import { getUserId } from "@/app/lib/session";
import { getUser } from "@/app/lib/actions";

// components
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// ui
import Nav from "@/app/ui/nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pong",
  description: "Classic Pong game",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserId();
  const user = userId ? await getUser(Number(userId)) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"overflow-hidden " + inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider user={user}>
            <div className="flex flex-col px-16 h-[100vh]">
              <Nav />
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
