import Nav from "@/components/Nav";
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

export type User = { id: number; name?: string; email?: string };

async function getUsers(): Promise<User[]> {
  const res = await fetch(`${process.env.API_URL}/user`, {
    cache: "no-cache",
  });
  const users = await res.json();
  return users;
}

export default async function UserListPage() {
  const users = await getUsers();
  return (
  <div className="flex flex-wrap gap-8">
	{users.map((user, index) => (
	  <Card className="w-[300px]" key={index}>
		<CardHeader>ID: {user.id}</CardHeader>
		<CardContent>
		  <form>
			<div className="grid w-full items-center gap-4">
			  <div className="flex flex-col space-y-1.5">
				<Label htmlFor="name">Name</Label>
				<Input id="name" value={user.name} />
			  </div>
			  <div className="flex flex-col space-y-1.5">
				<Label htmlFor="email">Email</Label>
				<Input id="email" value={user.email} />
			  </div>
			</div>
		  </form>
		</CardContent>
		<CardFooter className="flex justify-between">
		  <Button variant="outline">Delete</Button>
		  <Button>Update</Button>
		</CardFooter>
	  </Card>
	))}
  </div>
  );
}
