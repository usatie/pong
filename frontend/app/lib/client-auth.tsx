"use client";
import type { JwtPayload, UserEntity } from "@/app/lib/types";
import { createContext, useContext } from "react";

export type AuthContextType = {
  payload?: JwtPayload;
  currentUser?: UserEntity;
};

export const AuthContext = createContext<AuthContextType>({});

export const useAuthContext = () => useContext(AuthContext);
