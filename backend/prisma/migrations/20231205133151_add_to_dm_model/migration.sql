/*
  Warnings:

  - Added the required column `createdAt` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "createdAt" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
