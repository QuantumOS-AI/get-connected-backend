/*
  Warnings:

  - You are about to drop the column `response` on the `AiMessage` table. All the data in the column will be lost.
  - Added the required column `senderType` to the `AiMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiMessage" DROP COLUMN "response",
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "estimateId" TEXT,
ADD COLUMN     "senderType" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
