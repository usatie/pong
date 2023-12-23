import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import { getAccessTokenPayload } from "@/app/lib/session";
import AuthProvider from "@/app/lib/client-auth-provider";

// components
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// ui
import Nav from "@/app/ui/nav";
import { getMe } from "@/app/lib/actions";
import { JwtPayload } from "@/app/lib/client-auth";

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
  const payload = await getAccessTokenPayload({ ignoreExpiration: true }); // Allows expired tokens
  let user;
  try {
    user = await getMe();
  } catch (err) {
    console.log("Error getting user", err);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider payload={payload as JwtPayload} user={user}>
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
