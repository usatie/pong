"use client";

import { RedirectType, redirect } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export async function createUser(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    toast({
      title: res.status + " " + res.statusText,
      description: data.message,
    });
  } else {
    toast({
      title: "Success",
      description: "User created successfully.",
    });
    redirect("/user", RedirectType.push);
  }
}

export async function createRoom(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.get("name"),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    toast({
      title: res.status + " " + res.statusText,
      description: data.message,
    });
  } else {
    toast({
      title: "Success",
      description: "Room created successfully.",
    });
    redirect(`/room/${data.id}`, RedirectType.push);
  }
}

async function updateRoom(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const { id, ...updateData } = Object.fromEntries(
    new FormData(event.currentTarget),
  );
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/room/${room.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    toast({
      title: res.status + " " + res.statusText,
      description: data.message,
    });
  } else {
    toast({
      title: "Success",
      description: "room updated successfully.",
    });
    router.push("/room");
    router.refresh();
  }
}

async function deleteRoom(event: React.SyntheticEvent) {
  event.preventDefault();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/room/${room.id}`,
    {
      method: "DELETE",
    },
  );
  const data = await res.json();
  if (!res.ok) {
    toast({
      title: res.status + " " + res.statusText,
      description: data.message,
    });
  } else {
    toast({
      title: "Success",
      description: "room deleted successfully.",
    });
    router.push("/room");
    router.refresh();
  }
}
