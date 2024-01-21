-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauthEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
