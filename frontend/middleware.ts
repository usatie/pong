import { getAccessTokenPayload } from "@/app/lib/session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isPathProtected(path: string) {
  if (path == "/signup") return false;
  return (
    path.startsWith("/user") ||
    path.startsWith("/room") ||
    path.startsWith("/settings") ||
    path.startsWith("/explore-rooms")
  );
}

function isPath2FAOnly(path: string) {
  return path == "/login/2fa";
}

function isPathGuestOnly(path: string) {
  return path == "/login" || path == "/signup";
}

export default async function authMiddleware(request: NextRequest) {
  // 1. Authenticated user
  // 2. 2FA user
  // 3. Guest
  const userStatus: "AUTHENTICATED" | "2FA" | "GUEST" = await (async () => {
    const payload = await getAccessTokenPayload({ ignoreExpiration: true });
    if (!payload) return "GUEST";
    if (payload.isTwoFactorEnabled && !payload.isTwoFactorAuthenticated)
      return "2FA";
    return "AUTHENTICATED";
  })();
  console.log("userStatus: ", userStatus);

  // a. Protected path
  // b. Guest-only path
  // c. Public path
  const pathStatus: "PROTECTED" | "GUEST_ONLY" | "2FA" | "PUBLIC" = (() => {
    if (isPathProtected(request.nextUrl.pathname)) return "PROTECTED";
    if (isPathGuestOnly(request.nextUrl.pathname)) return "GUEST_ONLY";
    if (isPath2FAOnly(request.nextUrl.pathname)) return "2FA";
    return "PUBLIC";
  })();
  console.log("pathStatus: ", pathStatus);

  switch (userStatus) {
    case "AUTHENTICATED":
      switch (pathStatus) {
        case "GUEST_ONLY":
        case "2FA":
          return NextResponse.redirect(new URL("/", request.nextUrl));
        case "PUBLIC":
        case "PROTECTED":
          return NextResponse.next();
      }
    case "2FA":
      // if (request.nextUrl.pathname == "/login/2fa") return NextResponse.next();
      // else return NextResponse.redirect(new URL("/login/2fa", request.nextUrl));
      switch (pathStatus) {
        case "PROTECTED":
        case "GUEST_ONLY":
        case "PUBLIC":
          return NextResponse.redirect(new URL("/login/2fa", request.nextUrl));
        case "2FA":
          return NextResponse.next();
      }
    case "GUEST":
      switch (pathStatus) {
        case "2FA":
        case "PROTECTED":
          return NextResponse.redirect(new URL("/login", request.nextUrl));
        case "GUEST_ONLY":
        case "PUBLIC":
          return NextResponse.next();
      }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|vercel.svg).*)"],
};
