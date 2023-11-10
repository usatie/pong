"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function LoginForm() {
  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle className="text-center">Pong</CardTitle>
        </CardHeader>
        <CardContent>
          <Form />
        </CardContent>
      </Card>
    </>
  );
}

function login() {
  // TODO: implement login
  console.log("login");
}

function Form() {
  return (
    <form action={login}>
      <div className="grid w-full items-center gap-8">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email address"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
          />
        </div>
        <LoginButton />
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending}>
      Log in
    </Button>
  );
}
