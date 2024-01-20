-- CreateTable
CREATE TABLE "MuteUserOnRoom" (
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "MuteUserOnRoom_userId_roomId_key" ON "MuteUserOnRoom"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "MuteUserOnRoom" ADD CONSTRAINT "MuteUserOnRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuteUserOnRoom" ADD CONSTRAINT "MuteUserOnRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
