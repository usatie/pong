import Image from "next/image";
import { ModeToggle } from "@/components/toggle-mode";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "@/app/lib/actions";

export default function Nav() {
  return (
    <header>
      <nav>
        <ul className="flex items-center justify-between">
          <li>
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={300 / 3}
              height={68 / 3}
              priority
            />
          </li>
          <li className="flex gap-8 items-center">
            <Link href="/">Home</Link>
            <Link href="/user">User List</Link>
            <Link href="/room">ChatRoom List</Link>
            <Link href="/user/signup">Sign Up</Link>
            <Link href="/pong">Pong</Link>
            <form action={signOut}>
              <Button type="submit">Sign Out</Button>
            </form>
            <ModeToggle></ModeToggle>
          </li>
        </ul>
      </nav>
    </header>
  );
}
