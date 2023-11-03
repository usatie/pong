"use client";

import { useRouter } from "next/navigation";

// components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

function CreateUser(toast: any, router: any) {
  return async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget)),
      ),
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
      router.push("/user");
      router.refresh();
    }
  };
}

export default function UserCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const createUser = CreateUser(toast, router);
  return (
    <form onSubmit={createUser}>
      <div className="grid w-full items-center gap-8">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">User Name</Label>
          <Input id="name" type="text" name="name" placeholder="e.g. nop" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="e.g. nop@42.fr" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" name="password" placeholder="Must have at least 6 characters"/>
        </div>
        <Button type="submit">Sign Up</Button>
      </div>
    </form>
  );
}
