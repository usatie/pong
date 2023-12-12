-- DropForeignKey
ALTER TABLE "MatchDetail" DROP CONSTRAINT "MatchDetail_userId_fkey";

-- AddForeignKey
ALTER TABLE "MatchDetail" ADD CONSTRAINT "MatchDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
