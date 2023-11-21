/*
  Warnings:

  - You are about to drop the `useronroom` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMINISTRATOR', 'MEMBER');

-- DropForeignKey
ALTER TABLE "useronroom" DROP CONSTRAINT "useronroom_roomid_fkey";

-- DropForeignKey
ALTER TABLE "useronroom" DROP CONSTRAINT "useronroom_userid_fkey";

-- DropTable
DROP TABLE "useronroom";

-- CreateTable
CREATE TABLE "UserOnRoom" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "UserOnRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOnRoom_userId_roomId_key" ON "UserOnRoom"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "UserOnRoom" ADD CONSTRAINT "UserOnRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnRoom" ADD CONSTRAINT "UserOnRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
