/*
  Warnings:

  - The primary key for the `UserOnRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserOnRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserOnRoom" DROP CONSTRAINT "UserOnRoom_pkey",
DROP COLUMN "id";
