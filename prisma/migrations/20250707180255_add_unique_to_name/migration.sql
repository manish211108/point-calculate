/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `LeaderboardEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_name_key" ON "LeaderboardEntry"("name");
