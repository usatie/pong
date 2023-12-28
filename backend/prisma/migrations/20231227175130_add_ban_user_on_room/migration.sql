-- CreateTable
CREATE TABLE "BanUserOnRoom" (
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BanUserOnRoom_userId_roomId_key" ON "BanUserOnRoom"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "BanUserOnRoom" ADD CONSTRAINT "BanUserOnRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanUserOnRoom" ADD CONSTRAINT "BanUserOnRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
