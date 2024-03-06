"use client";

import Form from "@/app/ui/user/create-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

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

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const errorStatusCode = searchParams.get("status");
  const errorMessage = searchParams.get("message");

  useEffect(() => {
    if (errorStatusCode && errorMessage) {
      showErrorToast(errorStatusCode, errorMessage);
    }
  }, [errorStatusCode, errorMessage]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
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
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/signup/oauth2/42`}
            >
              Sign up with 42
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
