-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "password" TEXT;
