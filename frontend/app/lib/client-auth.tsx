"use client";
import { createContext, useContext } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  avatarURL?: string;
  createdAt: string;
};

type AuthContextType = {
  currentUser?: User;
};

const AuthContext = createContext<AuthContextType>({});

export const useAuthContext = () => useContext(AuthContext);
export const useIsLoggedInContext = () => useAuthContext().currentUser != null;

export type AuthProviderProps = {
  user?: User;
  children: React.ReactNode;
};

export default function AuthProvider({ children, user }: AuthProviderProps) {
  const auth = { currentUser: user };
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
