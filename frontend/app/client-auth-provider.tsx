"use client";

import { AuthContext } from "@/app/lib/client-auth";

type User = {
  id: number;
  name: string;
  email: string;
  avatarURL?: string;
  createdAt: string;
};

export type AuthProviderProps = {
  user?: User;
  children: React.ReactNode;
  isLoggedIn: boolean;
};

export default function AuthProvider({
  children,
  user,
  isLoggedIn,
}: AuthProviderProps) {
  const auth = { currentUser: user, isLoggedIn };
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
