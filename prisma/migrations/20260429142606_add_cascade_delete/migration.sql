-- DropForeignKey
ALTER TABLE `clicklog` DROP FOREIGN KEY `ClickLog_linkId_fkey`;

-- DropForeignKey
ALTER TABLE `linkstat` DROP FOREIGN KEY `LinkStat_linkId_fkey`;

-- DropIndex
DROP INDEX `ClickLog_linkId_fkey` ON `clicklog`;

-- AddForeignKey
ALTER TABLE `LinkStat` ADD CONSTRAINT `LinkStat_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClickLog` ADD CONSTRAINT `ClickLog_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
