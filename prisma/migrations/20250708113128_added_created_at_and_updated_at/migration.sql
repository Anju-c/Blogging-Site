/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Follow_followerid_key";

-- DropIndex
DROP INDEX "Follow_followid_key";

-- CreateIndex
CREATE UNIQUE INDEX "Follow_id_key" ON "Follow"("id");
