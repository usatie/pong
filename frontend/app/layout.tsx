import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { getAccessTokenPayload } from "@/app/lib/session";
import AuthProvider from "./client-auth-provider";

// components
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// ui
import Nav from "@/app/ui/nav";
import { JwtPayload } from "./lib/client-auth";

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

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider payload={payload as JwtPayload}>
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
