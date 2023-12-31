import { Button } from "@/components/ui/button";
import Link from "next/link";
import { v4 } from "uuid";
import JoinRoomForm from "./JoinRoomForm";
import MatchButton from "./MatchButton";
import GameList from "./GameList";
import { isLoggedIn } from "../lib/session";

export default async function Page() {
  const isAuthorized = await isLoggedIn();
  const roomId = v4();
  return (
    <div className="flex flex-col gap-5 items-center">
      <Button disabled={!isAuthorized} asChild>
        <Link href={`/pong/${roomId}`}>Create a new room</Link>
      </Button>
      <MatchButton disabled={!isAuthorized}></MatchButton>
      <JoinRoomForm disabled={!isAuthorized} />
      <GameList />
    </div>
  );
}
