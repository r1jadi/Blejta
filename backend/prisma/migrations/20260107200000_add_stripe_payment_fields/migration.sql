-- AlterTable
-- Add updatedAt column with default value for existing rows
ALTER TABLE "Order" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add payment fields
ALTER TABLE "Order" ADD COLUMN "paymentIntentId" TEXT,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order"("paymentIntentId");

-- Update existing rows to set updatedAt to createdAt if needed
UPDATE "Order" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
