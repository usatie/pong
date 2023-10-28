import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// components
import { ThemeProvider } from "@/components/theme-provider";
import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pong",
  description: "Classic Pong game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
		<main className="flex flex-col gap-8 p-16">
		  <Nav />
          {children}
    	</main>
		<Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
