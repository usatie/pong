// components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Form from "@/app/ui/room/create-form";

export default function CreateChatRoom() {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Create ChatRoom</CardTitle>
      </CardHeader>
      <CardContent>
        <Form />
      </CardContent>
    </Card>
  );
}
