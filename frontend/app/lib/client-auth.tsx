"use client";
import { createContext, useContext } from "react";
import { UserEntity } from "./actions";

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
