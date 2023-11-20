import { ModeToggle } from "@/components/toggle-mode";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "@/app/lib/actions";
import { isLoggedIn } from "@/app/lib/session";

function AuthorizedMenu() {
  return (
    <li className="flex gap-8 items-center">
      <Link href="/user">User List</Link>
      <Link href="/room">ChatRoom List</Link>
      <form action={signOut}>
        <Button type="submit">Sign Out</Button>
      </form>
      <ModeToggle></ModeToggle>
    </li>
  );
}

function UnauhtorizedMenu() {
  return (
    <li className="flex gap-8 items-center">
      <Link href="/user/signup">Sign Up</Link>
      <Link href="/login">Log In</Link>
      <ModeToggle></ModeToggle>
    </li>
  );
}

export default async function Nav() {
  return (
    <header>
      <nav>
        <ul className="flex items-center justify-between">
          <Link href="/" className="font-black">
            Pong
          </Link>
          {(await isLoggedIn()) ? <AuthorizedMenu /> : <UnauhtorizedMenu />}
        </ul>
      </nav>
    </header>
  );
}
