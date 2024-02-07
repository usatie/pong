import { isLoggedIn } from "../lib/session";
import GameList from "./GameList";
import JoinRoomForm from "./JoinRoomForm";

export default async function Page() {
  const isAuthorized = await isLoggedIn();
  return (
    <div className="flex gap-4 justify-center">
      {isAuthorized ? (
        <>
          <JoinRoomForm />
          <GameList />
        </>
      ) : (
        <div className="flex flex-col gap-4 max-w-[400px]">
          <p className="self-center">
            You can watch games, but you need to log in to play!
          </p>
          <GameList />
        </div>
      )}
    </div>
  );
}
