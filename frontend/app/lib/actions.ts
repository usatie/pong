"use server";

import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

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

function getAccessToken() {
  const accessToken = cookies()?.get("token")?.value;
  if (!accessToken) {
    throw new Error("No access token found");
  }
  return accessToken;
}

export async function updateUser(formData: FormData) {
  const { user_id, ...updateData } = Object.fromEntries(formData.entries());
  const res = await fetch(`${process.env.API_URL}/user/${user_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) {
    console.log("update failed: ", data);
    return "Error";
    // TODO: show some kind of notification on client side (toast?)
  } else {
    console.log("update succeeded: ", data);
    // TODO: show some kind of notification on client side (toast?)
    return "Success";
  }
}

export async function deleteUser(formData: FormData) {
  const { user_id } = Object.fromEntries(formData.entries());
  const res = await fetch(`${process.env.API_URL}/user/${user_id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    console.log("delete failed: ", data);
    // TODO: show some kind of notification on client side (toast?)
    return "Error";
  } else {
    console.log("delete succeeded: ", data);
    // TODO: show some kind of notification on client side (toast?)
    redirect("/user", RedirectType.replace);
    return "Success";
  }
}
