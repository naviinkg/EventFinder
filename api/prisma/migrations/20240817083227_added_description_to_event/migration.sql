/*
  Warnings:

  - The primary key for the `venues` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `events` MODIFY `venueId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `venues` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
