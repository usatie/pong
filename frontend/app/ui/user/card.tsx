// components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateUser, deleteUser } from "@/app/lib/actions";

export type User = { id: number; name?: string; email?: string };

export default function UserCard({ user }: { user: User }) {
  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>ID: {user.id}</CardHeader>
        <CardContent>
          <form action={updateUser} id={"UpdateUserForm." + user.id}>
            <input type="hidden" name="user_id" value={user.id} />
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={user.name}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  defaultValue={user.email}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <form action={deleteUser}>
            <input type="hidden" name="user_id" value={user.id} />
            <Button type="submit">Delete</Button>
          </form>
          <Button
            variant="outline"
            type="submit"
            form={"UpdateUserForm." + user.id}
          >
            Update
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
