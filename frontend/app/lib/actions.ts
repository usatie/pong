"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  cookies().delete("token");
  redirect("/");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error("Authentication failed");
      return;
    }
    cookies().set("token", data.accessToken, { path: "/" });
    redirect("/");
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return "CredentialSignin";
    }
    throw error;
  }
}
