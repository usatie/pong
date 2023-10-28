"use client";

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
import { useToast } from "@/components/ui/use-toast"

export default function SignUp() {
  const { toast } = useToast()
	async function createUser(event: React.FormEvent<HTMLFormElement>) {
	  event.preventDefault();
	  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
	    method: "POST",
	    headers: {
	  	"Content-Type": "application/json",
	    },
	    body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
	  });
	  const data = await res.json();
	  if (!res.ok) {
	  	toast({
	  	  title: res.status + " " + res.statusText,
	  	  description: data.message,
	  	})
	  } else {
	  	toast({
	  	  title: "Success",
	  	  description: "User created successfully.",
	  	})
	  }
	}

  return (
	  <Card className="w-[300px]">
		<CardHeader>Create Account</CardHeader>
		<CardContent>
		  <form onSubmit={createUser}>
			<div className="grid w-full items-center gap-8">
			  <div className="flex flex-col space-y-1.5">
				<Label htmlFor="name">Name</Label>
				<Input id="name" type="text" name="name" placeholder="nop"/>
			  </div>
			  <div className="flex flex-col space-y-1.5">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" name="email" placeholder="nop@42.fr"/>
			  </div>
			  <Button type="submit">Sign Up</Button>
			</div>
		  </form>
	    </CardContent>
	  </Card>
  );
}
