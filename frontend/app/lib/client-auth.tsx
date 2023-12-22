"use client";
import { createContext, useContext } from "react";

export type JwtPayload = {
  userId: number;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated: boolean;
};

export type AuthContextType = {
  payload?: JwtPayload;
};

export const AuthContext = createContext<AuthContextType>({});

export const useAuthContext = () => useContext(AuthContext);
