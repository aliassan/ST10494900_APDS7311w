/*
  Warnings:

  - You are about to drop the column `recipientBank` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `swiftCode` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `calculatedAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientAccountNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientBankName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientCountry` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientSwiftCode` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "recipientBank",
DROP COLUMN "swiftCode",
ADD COLUMN     "calculatedAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'SWIFT',
ADD COLUMN     "recipientAccountNumber" TEXT NOT NULL,
ADD COLUMN     "recipientAddress" TEXT,
ADD COLUMN     "recipientBankName" TEXT NOT NULL,
ADD COLUMN     "recipientCity" TEXT,
ADD COLUMN     "recipientCountry" TEXT NOT NULL,
ADD COLUMN     "recipientSwiftCode" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");
