"use server";

import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function updateUser(
  prevState: string | undefined,
  formData: FormData,
) {
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
    return "Error";
  } else {
    revalidatePath("/user");
    revalidatePath(`/user/${user_id}`);
    return "Success";
  }
}

export async function deleteUser(
  prevState: string | undefined,
  formData: FormData,
) {
  const { user_id } = Object.fromEntries(formData.entries());
  const res = await fetch(`${process.env.API_URL}/user/${user_id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    const data = await res.json();
    return "Error";
  } else {
    revalidatePath("/user");
    revalidatePath(`/user/${user_id}`);
    return "Success";
  }
}
