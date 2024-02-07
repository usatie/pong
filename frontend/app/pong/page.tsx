import { Button } from "@/components/ui/button";
import Link from "next/link";
import { v4 } from "uuid";
import { isLoggedIn } from "../lib/session";
import GameList from "./GameList";
import JoinRoomForm from "./JoinRoomForm";
import MatchButton from "./MatchButton";

export default async function Page() {
  const isAuthorized = await isLoggedIn();
  const roomId = v4();
  return (
    <div className="flex flex-col gap-5 items-center">
      {isAuthorized ? (
        <>
          <Button asChild>
            <Link href={`/pong/${roomId}`}>Create a new room</Link>
          </Button>
          <MatchButton></MatchButton>
          <JoinRoomForm />
        </>
      ) : (
        <p>You need to log in to play.</p>
      )}
      <GameList />
    </div>
  );
}
