import Form from "@/app/ui/user/create-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignUpForm() {
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
