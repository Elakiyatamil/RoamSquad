/*
  Warnings:

  - You are about to drop the column `vibeDescription` on the `Accommodation` table. All the data in the column will be lost.
  - You are about to drop the column `durationMins` on the `TravelOption` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `TravelOption` table. All the data in the column will be lost.
  - Added the required column `description` to the `Accommodation` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `FoodOption` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cost` to the `TravelOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `TravelOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accommodation" DROP COLUMN "vibeDescription",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FoodOption" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "TravelOption" DROP COLUMN "durationMins",
DROP COLUMN "estimatedCost",
ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL;
