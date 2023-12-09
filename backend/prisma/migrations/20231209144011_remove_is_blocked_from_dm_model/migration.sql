/*
  Warnings:

  - You are about to drop the column `isBlocked` on the `DirectMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "isBlocked";
