"use client";

import { createUser } from "@/app/lib/client-actions";

// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserCreateForm() {
  return (
    <form action={createUser}>
      <div className="grid w-full items-center gap-8">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">User Name</Label>
          <Input id="name" type="text" name="name" placeholder="e.g. nop" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="e.g. nop@42.fr"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Must have at least 6 characters"
          />
        </div>
        <Button type="submit">Sign Up</Button>
      </div>
    </form>
  );
}
