/*
  Warnings:

  - The primary key for the `link` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `linkstat` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `clicklog` DROP FOREIGN KEY `ClickLog_linkId_fkey`;

-- DropForeignKey
ALTER TABLE `linkstat` DROP FOREIGN KEY `LinkStat_linkId_fkey`;

-- DropIndex
DROP INDEX `ClickLog_linkId_fkey` ON `clicklog`;

-- AlterTable
ALTER TABLE `clicklog` MODIFY `linkId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `link` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `linkstat` DROP PRIMARY KEY,
    MODIFY `linkId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`linkId`);

-- AddForeignKey
ALTER TABLE `LinkStat` ADD CONSTRAINT `LinkStat_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClickLog` ADD CONSTRAINT `ClickLog_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
