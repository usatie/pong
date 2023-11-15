import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importSPKI } from "jose";

async function isTokenValid(token: string) {
  console.log("token = ", token);
  // Verify JWT token with public key
  const alg = "RS256";
  const spki = process.env.JWT_PUBLIC_KEY;
  if (!spki) {
    console.log("no public key");
    return false;
  }
  try {
    const publicKey = await importSPKI(spki, alg);
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ["RS256"],
    });
    console.log("jwt token is valid: ", payload);
    return true; // Allow request to continue with valid token
  } catch (e) {
    console.log("jwt token is invalid: ", e);
  }
  return false;
}

function isPathProtected(path: string) {
  return path == "/user" || path.startsWith("/room");
}

export default async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (token && (await isTokenValid(token.value))) {
    // If already logged in, redirect to top page
    if (request.nextUrl.pathname == "/login") {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    // Otherwise, allow request to continue
    return NextResponse.next();
  }
  // If not logged in, and accessing a protected page, redirect to login
  if (isPathProtected(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|vercel.svg).*)"],
};
