/*
  Warnings:

  - A unique constraint covering the columns `[letter_id,activity_id]` on the table `send_idempotency` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,activity_id]` on the table `sent_letters` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "send_idempotency" DROP CONSTRAINT "send_idempotency_letter_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "send_idempotency_letter_id_activity_id_key" ON "send_idempotency"("letter_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "sent_letters_id_activity_id_key" ON "sent_letters"("id", "activity_id");

-- AddForeignKey
ALTER TABLE "send_idempotency" ADD CONSTRAINT "send_idempotency_letter_id_activity_id_fkey" FOREIGN KEY ("letter_id", "activity_id") REFERENCES "sent_letters"("id", "activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;
