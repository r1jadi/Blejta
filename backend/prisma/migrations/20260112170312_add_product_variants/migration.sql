-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableModels" JSONB,
ADD COLUMN     "availableSizes" JSONB,
ADD COLUMN     "productType" TEXT NOT NULL DEFAULT 'GENERIC';
