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
import { authenticate } from "@/app/lib/actions";

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

function Form() {
  const [code, action] = useFormState(authenticate, undefined);
  return (
    <>
      <form action={action}>
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
        <div className="flex h-8 items-end space-x-1">
          {code === "CredentialSignin" && (
            <>
              <p aria-live="polite" className="text-sm text-red-500">
                Invalid credentials
              </p>
            </>
          )}
        </div>
      </form>
    </>
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
