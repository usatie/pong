import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getRooms } from "../lib/actions";

export default async function ExploreRoomsPage() {
  const rooms = await getRooms({ joined: false });
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold">Explore Rooms</h1>
      <div className="flex flex-wrap gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="basis-64">
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>{room.accessLevel}</CardDescription>
            </CardHeader>
            {room.accessLevel === "PROTECTED" ? (
              <CardContent>
                <Input placeholder="Enter password" />
              </CardContent>
            ) : (
              <div></div>
            )}
            <CardFooter>
              <Button variant={"outline"} className="w-full">
                Join
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
