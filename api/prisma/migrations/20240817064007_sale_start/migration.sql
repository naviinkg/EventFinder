/*
  Warnings:

  - You are about to drop the column `updated_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `venues` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `events` DROP COLUMN `updated_at`,
    MODIFY `salesStart` DATETIME(3) NULL,
    MODIFY `salesEnd` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `venues` DROP COLUMN `timezone`;
