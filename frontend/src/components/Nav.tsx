import Image from "next/image";
import { ModeToggle } from "./toggle-mode";

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
              width={100}
              height={24}
              priority
            />
          </li>
          <li>
            <ModeToggle></ModeToggle>
          </li>
        </ul>
      </nav>
    </header>
  );
}
