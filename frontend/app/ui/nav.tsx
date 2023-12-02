import { ModeToggle } from "@/components/toggle-mode";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn, signOut } from "@/app/lib/actions";
import { isLoggedIn } from "@/app/lib/session";
import { redirect } from "next/navigation";

function AuthorizedMenu() {
  return (
    <li className="flex gap-8 items-center">
      <Link href="/user">User List</Link>
      <Link href="/direct-message">DMs</Link>
      <Link href="/room">ChatRoom List</Link>
      <Link href="/pong">Game</Link>
      <form action={signOut}>
        <Button type="submit">Sign Out</Button>
      </form>
      <ModeToggle></ModeToggle>
    </li>
  );
}

async function signInAsTestUser() {
  "use server";
  const email = "test@example.com";
  const password = "password-test";
  await signIn({ email, password });
  redirect("/");
}

function UnauthorizedMenu() {
  return (
    <li className="flex gap-8 items-center">
      <Link href="/user/signup">Sign Up</Link>
      <Link href="/login">Log In</Link>
      {process.env.NODE_ENV === "development" && (
        <form action={signInAsTestUser}>
          <button type="submit">Log in as test</button>
        </form>
      )}
      <ModeToggle></ModeToggle>
    </li>
  );
}

export default async function Nav() {
  const isAuthorized = await isLoggedIn();
  return (
    <nav className="py-4">
      <ul className="flex items-center justify-between">
        <Link href="/" className="font-black">
          Pong
        </Link>
        {isAuthorized ? <AuthorizedMenu /> : <UnauthorizedMenu />}
      </ul>
    </nav>
  );
}
