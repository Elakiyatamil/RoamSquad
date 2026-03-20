/*
  Warnings:

  - Added the required column `title` to the `UpcomingEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UpcomingEvent" ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "dateTime" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "districtId" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "WishlistLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "itinerary" JSONB,
    "totalBudget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageInterest" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventInterest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInterest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageInterest" ADD CONSTRAINT "PackageInterest_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInterest" ADD CONSTRAINT "EventInterest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "UpcomingEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
