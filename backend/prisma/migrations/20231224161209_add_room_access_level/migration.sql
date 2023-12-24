/*
  Warnings:

  - Added the required column `accessLevel` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL,
ADD COLUMN     "password" TEXT;
