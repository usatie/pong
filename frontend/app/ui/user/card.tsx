import { redirect, RedirectType } from "next/navigation";
import { cookies } from "next/headers";

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

export type User = { id: number; name?: string; email?: string };

export default function UserCard({ user }: { user: User }) {
  async function updateUser(formData: FormData) {
    "use server";
    const cookieStore = cookies();
    const accessToken = cookieStore.get("token").value || "";
    const { id, ...updateData } = Object.fromEntries(formData.entries());
    console.log("updateData: ", updateData);
    const res = await fetch(`${process.env.API_URL}/user/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) {
      console.log("update failed: ", data);
      return "Error";
      // TODO: show some kind of notification on client side (toast?)
    } else {
      console.log("update succeeded: ", data);
      // TODO: show some kind of notification on client side (toast?)
      redirect(`/user/${user.id}`, RedirectType.rewrite);
      return "Success";
    }
  }
  async function deleteUser(event: React.SyntheticEvent) {
    "use server";
    const cookieStore = cookies();
    const accessToken = cookieStore.get("token").value || "";
    const res = await fetch(`${process.env.API_URL}/user/${user.id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      console.log("delete failed: ", data);
      // TODO: show some kind of notification on client side (toast?)
      return "Error";
    } else {
      console.log("delete succeeded: ", data);
      // TODO: show some kind of notification on client side (toast?)
      redirect("/user", RedirectType.push);
      return "Success";
    }
  }

  return (
    <>
      <Card className="w-[300px]">
        <CardHeader>ID: {user.id}</CardHeader>
        <CardContent>
          <form action={updateUser} id={"UpdateUserForm." + user.id}>
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
