/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ItineraryRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItineraryRequest" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
