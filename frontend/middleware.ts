import { isLoggedIn } from "@/app/lib/session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isPathProtected(path: string) {
  if (path == "/signup") return false;
  return (
    path.startsWith("/user") ||
    path.startsWith("/room") ||
    path.startsWith("/settings")
  );
}

function isPathGuestOnly(path: string) {
  return path == "/login" || path == "/signup";
}

export default async function authMiddleware(request: NextRequest) {
  // 1. Logged in users
  if (await isLoggedIn()) {
    console.log("Logged in user");
    // Redirect to "/"
    if (isPathGuestOnly(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    // Allow request to continue
    return NextResponse.next();
  }
  // 2. Guest users
  console.log("Guest user");
  if (isPathProtected(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|vercel.svg).*)"],
};
