import { getMatchHistory } from "@/app/lib/actions";
import type { MatchDetailEntity } from "@/app/lib/types";
import Link from "next/link";
import { Avatar } from "./avatar";
import ProfileItem from "./profile-item";

function MatchDetailItem({
  detail,
  isProfileUser,
}: {
  detail: MatchDetailEntity;
  isProfileUser: boolean;
}) {
  const textColor = isProfileUser
    ? detail.winLose === "WIN"
      ? "text-green-500"
      : "text-red-500"
    : "";
  return (
    <Link href={`/user/${detail.user.id}`}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Avatar avatarURL={detail.user.avatarURL} size="medium" />
          <div>{detail.user.name}</div>
          <div className={`font-bold ${textColor}`}>
            {detail.winLose} ({detail.score})
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function MatchHistory({ userId }: { userId: number }) {
  const history = await getMatchHistory(userId);
  return (
    <ProfileItem title="Match History">
      <div className="flex flex-col gap-2">
        {history.map((match) => {
          return (
            <div key={match.id} className="flex gap-8 items-center">
              <MatchDetailItem
                detail={match.players[0]}
                isProfileUser={match.players[0].user.id === userId}
              />
              <MatchDetailItem
                detail={match.players[1]}
                isProfileUser={match.players[1].user.id === userId}
              />
              <div className="text-sm">{match.createdAt}</div>
            </div>
          );
        })}
      </div>
    </ProfileItem>
  );
}
