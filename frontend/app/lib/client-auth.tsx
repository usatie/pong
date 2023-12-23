"use client";
import type { UserEntity } from "@/app/lib/types";
import { createContext, useContext } from "react";

export type JwtPayload = {
  userId: number;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated: boolean;
};

export type AuthContextType = {
  payload?: JwtPayload;
  currentUser?: UserEntity;
};

export const AuthContext = createContext<AuthContextType>({});

export const useAuthContext = () => useContext(AuthContext);
