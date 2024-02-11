import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AuthProvider from "@/app/lib/client-auth-provider";
import { getAccessTokenPayload } from "@/app/lib/session";

// components
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// ui
import { getMe } from "@/app/lib/actions";
import { JwtPayload } from "@/app/lib/dtos";
import { OnlineProviders } from "./onlineProviders";

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
            <Toaster />
            <OnlineProviders>{children}</OnlineProviders>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
