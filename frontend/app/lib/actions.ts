"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  cookies().delete("token");
  redirect("/");
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Authentication failed");
  }
  cookies().set("token", data.accessToken, {
    path: "/",
    httpOnly: true, // JS cannot access
    secure: process.env.NODE_ENV === "production", // HTTPS only
  });
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    redirect("/");
  } catch (error) {
    if ((error as Error).message.includes("Authentication failed")) {
      return "CredentialSignin";
    }
    throw error;
  }
}
