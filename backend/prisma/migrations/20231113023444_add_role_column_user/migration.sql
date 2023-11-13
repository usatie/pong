/*
  Warnings:

  - Added the required column `role` to the `useronroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "useronroom" ADD COLUMN     "role" TEXT NOT NULL;
