"use client";

import { useFormState } from "react-dom";
import { redirect, RedirectType } from "next/navigation";

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
import { toast } from "@/components/ui/use-toast";

import { updateUser, deleteUser } from "@/app/lib/actions";

export type User = { id: number; name?: string; email?: string };

export default function UserCard({ user }: { user: User }) {
  const [updateCode, updateAction] = useFormState(updateUser, undefined);
  const [deleteCode, deleteAction] = useFormState(deleteUser, undefined);

  if (updateCode == "Success") {
    toast({
      title: "Updated",
      description: "User has been updated successfully",
    });
  } else if (updateCode == "Error") {
    toast({
      title: "Error",
      description: "User could not be updated",
    });
  }

  if (deleteCode == "Success") {
    toast({
      title: "Deleted",
      description: "User has been deleted successfully",
    });
    redirect("/user", RedirectType.replace);
  } else if (deleteCode == "Error") {
    toast({
      title: "Error",
      description: "User could not be deleted",
    });
  }
  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>ID: {user.id}</CardHeader>
        <CardContent>
          <form action={updateAction} id={"UpdateUserForm." + user.id}>
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
          <form action={deleteAction}>
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
