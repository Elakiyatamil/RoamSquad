-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "userName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "state" TEXT,
    "district" TEXT,
    "itinerary" JSONB,
    "hotel" TEXT,
    "food" TEXT,
    "itinerarySnapshot" JSONB,
    "hotelSnapshot" JSONB,
    "foodSnapshot" JSONB,
    "days" INTEGER,
    "people" INTEGER,
    "totalBudget" INTEGER,
    "startDate" TIMESTAMP(3),
    "tripDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'INQUIRY SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);
