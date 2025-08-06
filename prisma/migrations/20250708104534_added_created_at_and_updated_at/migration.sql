-- CreateTable
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "followid" INTEGER NOT NULL,
    "followerid" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followid_key" ON "Follow"("followid");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerid_key" ON "Follow"("followerid");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followid_fkey" FOREIGN KEY ("followid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerid_fkey" FOREIGN KEY ("followerid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
