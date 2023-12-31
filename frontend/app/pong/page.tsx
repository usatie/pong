import { Button } from "@/components/ui/button";
import Link from "next/link";
import { v4 } from "uuid";
import JoinRoomForm from "./JoinRoomForm";
import MatchButton from "./MatchButton";
import GameList from "./GameList";

export default function Page() {
  const roomId = v4();
  return (
    <div className="flex flex-col content-between gap-5 mx-auto">
      {/* todo: use asChild */}
      <Button className="inline max-w-sm">
        <Link href={`/pong/${roomId}`} className="block">
          Create a new room
        </Link>
      </Button>
      <MatchButton></MatchButton>
      <JoinRoomForm />
      <GameList />
    </div>
  );
}
