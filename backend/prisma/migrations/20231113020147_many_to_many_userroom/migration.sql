/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_ownerId_fkey";

-- DropIndex
DROP INDEX "Room_ownerId_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "ownerId";

-- CreateTable
CREATE TABLE "useronroom" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "roomid" INTEGER NOT NULL,

    CONSTRAINT "useronroom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "useronroom" ADD CONSTRAINT "useronroom_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "useronroom" ADD CONSTRAINT "useronroom_roomid_fkey" FOREIGN KEY ("roomid") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
