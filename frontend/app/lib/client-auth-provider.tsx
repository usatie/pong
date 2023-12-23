"use client";

import { AuthContext, JwtPayload } from "@/app/lib/client-auth";
import type { UserEntity } from "@/app/lib/types";

export type AuthProviderProps = {
  children: React.ReactNode;
  payload?: JwtPayload;
  user?: UserEntity;
};

export default function AuthProvider({
  children,
  payload,
  user,
}: AuthProviderProps) {
  const auth = { payload, currentUser: user };
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
