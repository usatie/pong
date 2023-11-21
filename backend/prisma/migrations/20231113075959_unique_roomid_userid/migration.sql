/*
  Warnings:

  - A unique constraint covering the columns `[userid,roomid]` on the table `useronroom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "useronroom_userid_roomid_key" ON "useronroom"("userid", "roomid");
