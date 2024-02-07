"use client";

import { authenticate } from "@/app/lib/actions";
import { useAuthContext } from "@/app/lib/client-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

export default function LoginForm() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-8">
            <Form />
            <div className="flex gap-4 w-full">
              <Separator className="shrink self-center" />
              OR
              <Separator className="shrink self-center" />
            </div>
            <Button className="w-full" asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login/oauth2/42`}
              >
                Login with 42
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Form() {
  const { currentUser } = useAuthContext();
  const [code, action] = useFormState(authenticate, undefined);
  const router = useRouter();
  useEffect(() => {
    if (code === "Authenticated") {
      router.replace("/");
    }
  }, [code, router]);
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
              defaultValue={currentUser?.email}
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
        {code === "CredentialSignin" && (
          <div className="flex h-8 items-end space-x-1">
            <p aria-live="polite" className="text-sm text-red-500">
              Invalid credentials
            </p>
          </div>
        )}
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
