"use server";

import type { User } from "@/app/ui/user/card";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { Room } from "../ui/room/card";
import { destroySession, getCurrentUser, getCurrentUserId } from "./session";

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

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${process.env.API_URL}/room`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  const rooms = await res.json();
  return rooms;
}

export type GetRoomResponse = {
  id: number;
  name: string;
  users: UserOnRoom[];
};

export type UserOnRoom = {
  userId: number;
  role: string;
  roomId: number;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
};

export async function getRoom(roomId: number): Promise<GetRoomResponse> {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("getRoom error: ", await res.json());
    throw new Error("Room not found");
  }
  const room = await res.json();
  return room;
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

export async function updateRoomUser(
  role: string,
  roomId: number,
  userId: number,
) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: JSON.stringify({ role }),
  });
  console.log(res.status);
  if (!res.ok) {
    console.error("updateRoomUser error: ", await res.json());
    throw new Error("updateRoomUser error");
  } else {
    const update = await res.json();
    console.log(update);
    return "Success";
  }
}

export async function deleteUserOnRoom(roomId: number, userId: number) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("deleteUserOnRoom error: ", await res.json());
    throw new Error("deleteUserOnRoom error");
  } else {
    return "Success";
  }
}

export async function signInAsTestUser() {
  const email = "test@example.com";
  const password = "password-test";
  await signIn({ email, password });
  redirect("/");
}

export async function uploadAvatar(formData: FormData) {
  const userId = await getCurrentUserId();
  const payload = new FormData();
  payload.append("avatar", formData.get("avatar") as Blob);
  const res = await fetch(`${process.env.API_URL}/user/${userId}/avatar`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
    body: payload,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("uploadAvatar error: ", data);
    return "Error";
  } else {
    revalidatePath("/profile");
    return "Success";
  }
}

export async function getMessages(roomId: number) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}/messages`, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  const messages = await res.json();
  return messages;
}

export async function updatePassword(
  prevState: string | undefined,
  formData: FormData,
) {
  // Check if new password and confirm password match
  const newPassword = formData.get("new-password");
  const confirmPassword = formData.get("confirm-password");
  if (newPassword !== confirmPassword) {
    return "PasswordMismatch";
  }
  const currentPassword = formData.get("current-password");
  const user = await getCurrentUser();

  // Check if current password is correct
  const res1 = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: user.email, password: currentPassword }),
  });
  if (res1.status === 401) {
    return "Wrong password";
  }
  const data = await res1.json();
  if (!res1.ok) {
    return data.message;
  }

  // Update password
  const res = await fetch(`${process.env.API_URL}/user/${user.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + data.accessToken,
    },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    console.error("updatePassword error: ", await res.json());
    return "Error";
  } else {
    return "Success";
  }
}

export async function blockUser(blockedUserId: number) {
  const userId = await getCurrentUserId();
  const res = await fetch(`${process.env.API_URL}/user/${userId}/block`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blockedUserId: blockedUserId }),
  });
  if (!res.ok) {
    console.error("blockUser error: ", await res.json());
    return "Error";
  } else {
    return "Success";
  }
}

export async function unblockUser(blockedUserId: number) {
  const userId = await getCurrentUserId();
  const res = await fetch(`${process.env.API_URL}/user/${userId}/unblock`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blockedUserId: blockedUserId }),
  });
  if (!res.ok) {
    console.error("unblockUser error: ", await res.json());
    return "Error";
  } else {
    return "Success";
  }
}
