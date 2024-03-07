"use client";

import { authenticate } from "@/app/lib/actions";
import { useAuthContext } from "@/app/lib/client-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

const getStatusText = (statusCode: string) => {
  let statusText = "";
  switch (statusCode) {
    case "400":
      statusText = "Bad Request";
      break;
    case "401":
      statusText = "Unauthorized";
      break;
    case "403":
      statusText = "Forbidden";
      break;
    case "404":
      statusText = "Not Found";
      break;
    case "409":
      statusText = "Conflict";
      break;
    case "500":
      statusText = "Internal Server Error";
      break;
    default:
      statusText = "Error";
      break;
  }
  return statusText;
};

const showErrorToast = (statusCode: string, message: string) => {
  const statusText = getStatusText(statusCode);
  toast({
    title: statusCode + " " + statusText,
    description: message,
  });
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const errorStatusCode = searchParams.get("status");
  const errorMessage = searchParams.get("message");
  useEffect(() => {
    if (errorStatusCode && errorMessage) {
      showErrorToast(errorStatusCode, errorMessage);
    }
  }, [errorStatusCode, errorMessage]);
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
