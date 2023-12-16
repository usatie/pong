"use client";
import { useContext } from "react";
import { createContext } from "react";

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

export const AuthContext = createContext<AuthContextType>({});

export const useAuth = () => useContext(AuthContext);
export const useIsLoggedIn = () => useAuth().currentUser != null;

export type AuthProviderProps = {
  user?: User;
  children: React.ReactNode;
};

export default function AuthProvider({ children, user }: AuthProviderProps) {
  const auth = { currentUser: user };
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
