// components
import Form from "@/app/ui/room/create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
