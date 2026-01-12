-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableColors" JSONB,
ADD COLUMN     "availableFootSizes" JSONB,
ADD COLUMN     "requiresFootSize" BOOLEAN NOT NULL DEFAULT false;
