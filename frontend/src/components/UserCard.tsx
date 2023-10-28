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

export default function UserCard({ user }: { user: User }) {
  console.log(user);
  return (
  <>
	  <Card className="w-[300px]">
		<CardHeader>ID: {user.id}</CardHeader>
		<CardContent>
		  <form>
			<div className="grid w-full items-center gap-4">
			  <div className="flex flex-col space-y-1.5">
				<Label htmlFor="name">Name</Label>
				<Input id="name" defaultValue={user.name} />
			  </div>
			  <div className="flex flex-col space-y-1.5">
				<Label htmlFor="email">Email</Label>
				<Input id="email" defaultValue={user.email} />
			  </div>
			</div>
		  </form>
		</CardContent>
		<CardFooter className="flex justify-between">
		  <Button variant="outline">Delete</Button>
		  <Button>Update</Button>
		</CardFooter>
	  </Card>
  </>
  );
}
