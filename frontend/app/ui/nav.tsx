import { signInAsTestUser, signOut } from "@/app/lib/actions";
import { isLoggedIn } from "@/app/lib/session";
import { ModeToggle } from "@/components/toggle-mode";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AuthorizedMenu() {
  return (
    <li className="flex flex-wrap gap-x-4 items-center whitespace-nowrap">
      <Link href="/user">User List</Link>
      <Link href="/room">Chat</Link>
      <Link href="/pong">Game</Link>
      <Link href="/settings">Settings</Link>
      <form action={signOut}>
        <Button type="submit">Sign Out</Button>
      </form>
      <ModeToggle></ModeToggle>
    </li>
  );
}

function UnauthorizedMenu() {
  return (
    <li className="flex flex-wrap gap-x-4 items-center whitespace-nowrap">
      <Link href="/signup">Sign Up</Link>
      <Link href="/login">Log In</Link>
      {process.env.NODE_ENV === "development" && (
        <form action={signInAsTestUser}>
          <button type="submit">Log in as test</button>
        </form>
      )}
      <Link href="/pong">Game</Link>
      <ModeToggle></ModeToggle>
    </li>
  );
}

export default async function Nav() {
  const isAuthorized = await isLoggedIn();
  return (
    <nav className="py-4">
      <ul className="flex flex-wrap items-center justify-between">
        <Link href="/" className="font-black">
          Pong
        </Link>
        {isAuthorized ? <AuthorizedMenu /> : <UnauthorizedMenu />}
      </ul>
    </nav>
  );
}
