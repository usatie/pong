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
