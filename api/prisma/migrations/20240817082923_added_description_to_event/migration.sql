/*
  Warnings:

  - You are about to alter the column `venueId` on the `events` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `venues` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `location` on the `venues` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `venues` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `events` MODIFY `venueId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `venues` DROP PRIMARY KEY,
    DROP COLUMN `location`,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
