import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatHome() {
  return (
    <div className="flex items-center justify-center">
      <Card className="w-[800px] h-[650px] grid grid-rows-[min-content_1fr_min-content]">
        <CardHeader>
          <CardTitle>Chat room</CardTitle>
          <CardDescription>Experimental chat room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 text-slate-600 text-sm">
            <p className="mt-2">example chat: Hello!</p>
          </div>
          <div className="flex gap-3 text-slate-600 text-sm">
            <p className="ml-2">example chat: Hello!</p>
          </div>
        </CardContent>
        <CardFooter className="space-x-2">
          <Input placeholder="Message..." />
          <Button type="submit">Send</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
