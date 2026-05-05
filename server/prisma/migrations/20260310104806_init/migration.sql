-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "coverImage" TEXT,
    "images" TEXT[],
    "avgCost" TEXT,
    "bestSeason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "duration" TEXT,
    "price" INTEGER NOT NULL,
    "priceLabel" TEXT,
    "difficulty" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodOption" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "mealType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceLabel" TEXT,
    "description" TEXT,
    "dietaryTags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FoodOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "hotelNameInternal" TEXT,
    "vibeDescription" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "includes" TEXT[],
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelOption" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "estimatedCost" TEXT,
    "durationMins" INTEGER,

    CONSTRAINT "TravelOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MustVisitSpot" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MustVisitSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpcomingEvent" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bannerImage" TEXT,
    "location" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpcomingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "highlights" TEXT[],
    "tag" TEXT,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryRequest" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "travelDates" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "travelers" INTEGER NOT NULL,
    "activities" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'new',
    "agentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_countryId_key" ON "State"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_stateId_key" ON "District"("name", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOption" ADD CONSTRAINT "FoodOption_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accommodation" ADD CONSTRAINT "Accommodation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelOption" ADD CONSTRAINT "TravelOption_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MustVisitSpot" ADD CONSTRAINT "MustVisitSpot_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpcomingEvent" ADD CONSTRAINT "UpcomingEvent_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
