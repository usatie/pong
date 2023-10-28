"use client";

import { useRouter } from "next/navigation";

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
import { useToast } from "@/components/ui/use-toast";

export type User = { id: number; name?: string; email?: string };

export default function UserCard({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  async function updateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { id, ...updateData } = Object.fromEntries(
      new FormData(event.currentTarget),
    );
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: res.status + " " + res.statusText,
        description: data.message,
      });
    } else {
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      router.push("/user");
      router.refresh();
    }
  }
  async function deleteUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`,
      {
        method: "DELETE",
      },
    );
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: res.status + " " + res.statusText,
        description: data.message,
      });
    } else {
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      router.push("/user");
      router.refresh();
    }
  }
  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>ID: {user.id}</CardHeader>
        <CardContent>
          <form onSubmit={updateUser} id={"UpdateUserForm." + user.id}>
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
          <Button type="button" onClick={deleteUser}>
            Delete
          </Button>
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
