import { getMatchHistory } from "@/app/lib/actions";
import ProfileItem from "./profile-item";

async function getStats(userId: number) {
  const history = await getMatchHistory(userId);
  const wins = history.filter(
    (m) =>
      m.result == "COMPLETE" &&
      m.players.some((p) => p.user.id === userId && p.winLose === "WIN"),
  ).length;
  const losses = history.filter(
    (m) =>
      m.result == "COMPLETE" &&
      m.players.some((p) => p.user.id === userId && p.winLose === "LOSE"),
  ).length;
  const winRate = wins / (wins + losses);
  const winRatePercent = Math.round(winRate * 100);
  const loseRatePercent = 100 - winRatePercent;
  const incompletes = history.filter((m) => m.result == "INCOMPLETE").length;
  const totalPointsWon = history.reduce((sum, m) => {
    return sum + (m.players.find((p) => p.user.id === userId)?.score ?? 0);
  }, 0);
  const totalPointsLost = history.reduce((sum, m) => {
    return sum + (m.players.find((p) => p.user.id !== userId)?.score ?? 0);
  }, 0);
  return {
    wins,
    losses,
    winRatePercent,
    loseRatePercent,
    incompletes,
    totalPointsWon,
    totalPointsLost,
  };
}

export default async function Stats({ userId }: { userId: number }) {
  const {
    wins,
    losses,
    winRatePercent,
    loseRatePercent,
    incompletes,
    totalPointsWon,
    totalPointsLost,
  } = await getStats(userId);
  return (
    <ProfileItem title="Stats">
      <div className="flex flex-col gap-1">
        <div>
          Win: {wins} ({winRatePercent}%)
        </div>
        <div>
          Lose: {losses} ({loseRatePercent}%)
        </div>
        <div>Incomplete Match: {incompletes}</div>
        <div>Total Points Won: {totalPointsWon}</div>
        <div>Total Points Lost: {totalPointsLost}</div>
      </div>
    </ProfileItem>
  );
}
