-- AlterTable
ALTER TABLE "LandingPage" ADD COLUMN "defaultProductIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LandingPage" ADD COLUMN "sliderAutoPlay" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LandingPage" ADD COLUMN "sliderAutoPlayIntervalSec" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "LandingPageProduct" ADD COLUMN "displayRating" INTEGER;
