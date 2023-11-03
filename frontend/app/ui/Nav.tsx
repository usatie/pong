import Image from "next/image";
import { ModeToggle } from "@/components/toggle-mode";
import Link from "next/link";

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
            <Link href="/" className="">
              Home
            </Link>
            <Link href="/user">User List</Link>
            <Link href="/user/signup">Sign Up</Link>
            <Link href="/playground/pong.html" target="_blank">
              Pong
            </Link>
            <ModeToggle></ModeToggle>
          </li>
        </ul>
      </nav>
    </header>
  );
}
