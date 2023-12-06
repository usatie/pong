/*
  Warnings:

  - You are about to drop the column `conversationId` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `receiverId` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DirectMessage" DROP CONSTRAINT "DirectMessage_conversationId_fkey";

-- DropIndex
DROP INDEX "DirectMessage_conversationId_idx";

-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "conversationId",
DROP COLUMN "userName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiverId" INTEGER NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Conversation";

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
