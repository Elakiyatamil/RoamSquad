/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "difficulty",
DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "ItineraryRequest" ADD COLUMN     "travelType" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "userPhone" TEXT,
ADD COLUMN     "vibe" TEXT;

-- CreateTable
CREATE TABLE "TripPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "days" INTEGER NOT NULL,
    "travellers" INTEGER NOT NULL,
    "vibe" TEXT,
    "activities" JSONB,
    "timeline" JSONB,
    "estimatedBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_userId_entityType_entityId_key" ON "WishlistItem"("userId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "ItineraryRequest" ADD CONSTRAINT "ItineraryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPlan" ADD CONSTRAINT "TripPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
