"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import {
  AccessLevel,
  FriendRequestsEntity,
  GetRoomResponse,
  MatchHistoryEntity,
  PublicUserEntity,
  RoomEntity,
  UserEntity,
} from "./dtos";
import {
  destroySession,
  getCurrentUser,
  getCurrentUserId,
  setAccessToken,
} from "./session";

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
  setAccessToken(data.accessToken);
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

export async function getUsers(): Promise<PublicUserEntity[]> {
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

export async function getRooms(query: any = {}): Promise<RoomEntity[]> {
  let url = `${process.env.API_URL}/room`;
  if (query) {
    const params = new URLSearchParams(query);
    url += "?" + params.toString();
  }
  const res = await fetch(url, {
    cache: "no-cache",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("getRooms error: ", await res.json());
    throw new Error("getRooms error");
  }
  const rooms = await res.json();
  return rooms;
}

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

export async function createRoom(
  prevState: { error?: string },
  formData: FormData,
) {
  let payload;
  if (formData.get("accessLevel") === "PROTECTED") {
    payload = JSON.stringify({
      name: formData.get("name"),
      accessLevel: formData.get("accessLevel"),
      password: formData.get("password"),
      userIds: [],
    });
  } else {
    if (formData.get("password")) {
      return { error: "Only PROTECTED room needs password." };
    }
    payload = JSON.stringify({
      name: formData.get("name"),
      accessLevel: formData.get("accessLevel"),
      userIds: [],
    });
  }
  const res = await fetch(`${process.env.API_URL}/room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: payload,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("createRoom error: ", data);
    return { error: data.message };
  } else {
    redirect(`/room/${data.id}`, RedirectType.push);
  }
}

export async function joinRoom(
  roomId: number,
  prevState: { error: string } | undefined,
  formData: FormData,
) {
  const payload = JSON.stringify({
    password: formData.get("password"),
  });
  const res = await fetch(`${process.env.API_URL}/room/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: payload,
  });
  const data = await res.json();
  if (res.status === 409) {
    redirect(`/room/${roomId}`, RedirectType.push);
  } else if (!res.ok) {
    console.error("joinRoom error: ", data);
    return { error: data.message };
  } else {
    redirect(`/room/${roomId}`, RedirectType.push);
  }
}

export async function inviteUserToRoom(roomId: number, userId: number) {
  const res = await fetch(
    `${process.env.API_URL}/room/${roomId}/invite/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("inviteUserToRoom error: ", data);
    return "Error";
  } else {
    return "Success";
  }
}

export async function updateRoom(
  roomName: string,
  roomId: number,
  accessLevel: AccessLevel,
  password?: string,
) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: JSON.stringify({ name: roomName, accessLevel, password }),
  });
  if (!res.ok) {
    console.error("updateRoom error: ", await res.json());
    return "Error";
  } else {
    return "Success";
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

export async function kickUserOnRoom(roomId: number, userId: number) {
  const res = await fetch(
    `${process.env.API_URL}/room/${roomId}/kick/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("kickUserOnRoom error: ", await res.json());
    throw new Error("kickUserOnRoom error");
  } else {
    revalidatePath(`/room/${roomId}`);
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
    revalidatePath("/settings");
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

export async function getBlockingUsers() {
  const userId = await getCurrentUserId();
  const res = await fetch(`${process.env.API_URL}/user/${userId}/block`, {
    headers: {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.error("getBlockingUsers error: ", await res.json());
    throw new Error("getBlockingUsers error");
  } else {
    const blockingUsers = await res.json();
    return blockingUsers;
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

export async function getFriends(userId: number): Promise<PublicUserEntity[]> {
  const res = await fetch(`${process.env.API_URL}/user/${userId}/friend`, {
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("getFriends error: ", await res.json());
    return [];
  } else {
    const friends = await res.json();
    return friends;
  }
}

export async function addFriend(recipientId: number) {
  const requesterId = await getCurrentUserId();
  const res = await fetch(
    `${process.env.API_URL}/user/${requesterId}/friend-request/${recipientId}`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("addFriend error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/user/${recipientId}`);
    return "Success";
  }
}

export async function getFriendRequests(): Promise<FriendRequestsEntity> {
  const userId = await getCurrentUserId();
  const res = await fetch(
    `${process.env.API_URL}/user/${userId}/friend-request`,
    {
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("getFriendRequests error: ", await res.json());
    throw new Error("getFriendRequests error");
  } else {
    const friendRequests = await res.json();
    return friendRequests;
  }
}

export async function acceptFriendRequest(requesterId: number) {
  const userId = await getCurrentUserId();
  const res = await fetch(
    `${process.env.API_URL}/user/${userId}/friend-request/${requesterId}/accept`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("acceptFriendRequest error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/user/${requesterId}`);
    return "Success";
  }
}

export async function rejectFriendRequest(requesterId: number) {
  const userId = await getCurrentUserId();
  const res = await fetch(
    `${process.env.API_URL}/user/${userId}/friend-request/${requesterId}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("rejectFriendRequest error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/user/${requesterId}`);
    return "Success";
  }
}

export async function cancelFriendRequest(recipientId: number) {
  const userId = await getCurrentUserId();
  const res = await fetch(
    `${process.env.API_URL}/user/${userId}/friend-request/${recipientId}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("cancelFriendRequest error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/user/${recipientId}`);
    return "Success";
  }
}

export async function unfriend(friendId: number) {
  const userId = await getCurrentUserId();
  const res = await fetch(`${process.env.API_URL}/user/${userId}/unfriend/`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ friendId }),
  });
  if (!res.ok) {
    console.error("removeFriend error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/user/${friendId}`);
    return "Success";
  }
}

export async function getMatchHistory(
  userId: number,
): Promise<MatchHistoryEntity[]> {
  console.log(`${process.env.API_URL}/user/${userId}/history`);
  const res = await fetch(`${process.env.API_URL}/user/${userId}/history`, {
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("getMatchHistory error: ", await res.json());
    return [];
  } else {
    const matchHistory = await res.json();
    return matchHistory;
  }
}

export async function getMe(): Promise<UserEntity> {
  const res = await fetch(`${process.env.API_URL}/user/me`, {
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
    cache: "no-cache",
  });
  if (!res.ok) {
    console.error("getMe error: ", await res.json());
    throw new Error("getMe error");
  } else {
    const me = await res.json();
    return me;
  }
}

export async function generate2FASecret() {
  const res = await fetch(`${process.env.API_URL}/auth/2fa/generate`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("generate2FASecret error: ", await res.json());
    return "Error";
  } else {
    return res.json();
  }
}

export async function enableTwoFactorAuthentication(
  prevState: string,
  formData: FormData,
) {
  const code = formData.get("code") as string;
  const res = await fetch(`${process.env.API_URL}/auth/2fa/enable`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("enableTwoFactorAuthentication error: ", data);
    return JSON.stringify(data);
  } else {
    console.log("enableTwoFactorAuthentication success: ", data);
    setAccessToken(data.accessToken);
    return "Success";
  }
}

export async function twoFactorAuthenticate(
  prevState: string,
  formData: FormData,
) {
  const code = formData.get("code") as string;
  const res = await fetch(`${process.env.API_URL}/auth/2fa/authenticate`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("twoFactorAuthenticate error: ", data);
    return JSON.stringify(data);
  } else {
    console.log("twoFactorAuthenticate success: ", data);
    setAccessToken(data.accessToken);
    return "Success";
  }
}

export async function banUser(roomId: number, userId: number) {
  const res = await fetch(
    `${process.env.API_URL}/room/${roomId}/bans/${userId}`,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("banUser error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/room/${roomId}`);
    return "Success";
  }
}

export async function getBannedUsers(roomId: number) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}/bans`, {
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("getBannedUsers error: ", await res.json());
    return "Error";
  } else {
    const bannedUsers = res.json();
    return bannedUsers;
  }
}

export async function unbanUser(roomId: number, userId: number) {
  const res = await fetch(
    `${process.env.API_URL}/room/${roomId}/bans/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    },
  );
  if (!res.ok) {
    console.error("unbanUser error: ", await res.json());
    return "Error";
  } else {
    revalidatePath(`/room/${roomId}`);
    return "Success";
  }
}

export async function leaveRoom(roomId: number) {
  const res = await fetch(`${process.env.API_URL}/room/${roomId}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + getAccessToken(),
    },
  });
  if (!res.ok) {
    console.error("leaveRoom error: ", await res.json());
    return "Error";
  } else {
    redirect(`/room`, RedirectType.push);
    return "Success";
  }
}

export async function createUserWithOauth(
  code: string | string[] | undefined,
  provider: string
) {
  if (!code) return;
  const url = `${process.env.API_URL}/auth/oauth2/signup/${provider}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    console.error("createUserWithOauth error: ", await res.json());
    // TODO エラー表示 (signup しなければいけないことをユーザに伝える)
    redirect("/signup");
  } else {
    redirect("/login");
  }
}
