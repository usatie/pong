import { cookies } from "next/headers";
import * as jose from "jose";

// TODO: add types
export type Session = {};

// If JWT_SECRET is not set, then it will throw an error
const secret = jose.base64url.decode(process.env.JWT_SECRET!);
const spki = process.env.JWT_PUBLIC_KEY!;

/*
 * JWT token [for backend API] is stored in a cookie named "token"
 *
 * JWT token [for frontend] is stored in a cookie named "session"
 * Currently, the frontend JWT token is not used, but it could be used to store
 * user preferences, etc.
 *
 */
export async function isLoggedIn() {
  const payload = await getAccessTokenPayload({ ignoreExpiration: false });
  if (!payload) return false;
  return true;
}

export async function getUserId(): Promise<string | null> {
  const payload = await getAccessTokenPayload({ ignoreExpiration: true });
  if (!payload) return null;
  return payload.userId as string;
}

async function getAccessTokenPayload(options: any) {
  const token = cookies()?.get("token")?.value;
  if (!token) return null;
  try {
    // Verify JWT token with public key
    const alg = "RS256";
    const publicKey = await jose.importSPKI(spki, alg);
    const { payload } = await jose.jwtVerify(token, publicKey, {
      ...options,
      algorithms: ["RS256"],
    });
    return payload;
  } catch (e) {
    console.log("jwt token is invalid: ", e);
    return null;
  }
}

export async function setSession(session: Session) {
  console.log("setSession: ", session);
  const jwt = await new jose.EncryptJWT(session)
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .encrypt(secret);
  const cookieValue = cookies()?.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "strict",
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const jwt = cookies()?.get("session")?.value;
  if (!jwt) return null;
  try {
    const { payload, protectedHeader } = await jose.jwtDecrypt(jwt, secret);
    console.log("getSession: ", payload);
    return payload;
  } catch (err) {
    return null;
  }
}

export function destroySession() {
  console.log("destroySession");
  cookies()?.delete("session");
}
