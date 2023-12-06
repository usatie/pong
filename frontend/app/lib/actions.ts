"use server";

import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession } from "./session";
import type { User } from "@/app/ui/user/card";

export async function signOut() {
  cookies()?.delete("token");
  destroySession();
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
  cookies()?.set("token", data.accessToken, {
    httpOnly: true, // JS cannot access
    secure: process.env.NODE_ENV === "production", // HTTPS only
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "strict", // no CSRF
    path: "/",
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

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${process.env.API_URL}/user`, {
    cache: "no-cache",
  });
  const users = await res.json();
  return users;
}

export async function getUser(id: number) {
  const res = await fetch(`${process.env.API_URL}/user/${id}`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.log("getUser error: ", await res.json());
    return null;
  } else {
    const user = await res.json();
    return user;
  }
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

export async function getRoom(roomId: number) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("getRoom error: ", await res.json());
  } else {
    const room = await res.json();
    return room;
  }
}

export async function createRoom(formData: FormData) {
  const res = await fetch(`${process.env.API_URL}/room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: JSON.stringify({
      name: formData.get("name"),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("createRoom error: ", data);
  } else {
    redirect(`/room/${data.id}`, RedirectType.push);
  }
}

export async function joinRoom(
  prevState: void | undefined,
  formData: FormData,
) {
  const { roomId } = Object.fromEntries(formData.entries());
  const res = await fetch(`${process.env.API_URL}/room/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  const data = await res.json();
  if (res.status === 409) {
    redirect(`/room/${roomId}`, RedirectType.push);
  } else if (!res.ok) {
    console.error("joinRoom error: ", data);
  } else {
    redirect(`/room/${roomId}`, RedirectType.push);
  }
}

export async function getConversation(userId: number) {
  const res = await fetch(`${process.env.API_URL}/chat/${userId}`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (res.status === 404) {
    console.error("Not found conversation: ", await res.json());
    return null;
  } else if (!res.ok) {
    console.error("getConversation error: ", await res.json());
    throw new Error("createConversation error");
  } else {
    const conversation = await res.json();
    return conversation;
  }
}
