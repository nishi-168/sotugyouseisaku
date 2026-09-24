/*
  Warnings:

  - A unique constraint covering the columns `[userId,eventId]` on the table `Participation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_eventId_key" ON "Participation"("userId", "eventId");
