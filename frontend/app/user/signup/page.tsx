// components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Form from "@/app/ui/user/create-form";

export default function SignUp() {
  return (
    <Card className="w-[300px]">
      <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
      <CardContent>
        <Form />
      </CardContent>
    </Card>
  );
}
