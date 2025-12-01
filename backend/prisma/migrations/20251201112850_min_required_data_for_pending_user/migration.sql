/*
  Warnings:

  - You are about to drop the column `name` on the `PendingUser` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `PendingUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "name",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
