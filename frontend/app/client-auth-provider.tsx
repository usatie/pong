"use client";

import { AuthContext, JwtPayload } from "@/app/lib/client-auth";

export type AuthProviderProps = {
  children: React.ReactNode;
  payload?: JwtPayload;
};

export default function AuthProvider({ children, payload }: AuthProviderProps) {
  const auth = { payload };
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
