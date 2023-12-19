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
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
});

export const useAuthContext = () => useContext(AuthContext);
