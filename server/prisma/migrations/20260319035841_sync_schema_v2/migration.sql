/*
  Warnings:

  - You are about to drop the column `pricePerNight` on the `Accommodation` table. All the data in the column will be lost.
  - You are about to drop the column `priceLabel` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `priceLabel` on the `FoodOption` table. All the data in the column will be lost.
  - Added the required column `price` to the `Accommodation` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Activity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `Activity` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `FoodOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accommodation" DROP COLUMN "pricePerNight",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "vibeDescription" DROP NOT NULL,
ALTER COLUMN "stars" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "priceLabel",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FoodOption" DROP COLUMN "priceLabel",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "mealType" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
