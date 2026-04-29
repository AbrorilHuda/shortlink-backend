/*
  Warnings:

  - The primary key for the `clicklog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `clicklog` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `linkId` on the `clicklog` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `link` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `link` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `userId` on the `link` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `linkstat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `linkId` on the `linkstat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `clicklog` DROP FOREIGN KEY `ClickLog_linkId_fkey`;

-- DropForeignKey
ALTER TABLE `linkstat` DROP FOREIGN KEY `LinkStat_linkId_fkey`;

-- DropIndex
DROP INDEX `ClickLog_linkId_fkey` ON `clicklog`;

-- AlterTable
ALTER TABLE `clicklog` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `linkId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `link` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `userId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `linkstat` DROP PRIMARY KEY,
    MODIFY `linkId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`linkId`);

-- AddForeignKey
ALTER TABLE `LinkStat` ADD CONSTRAINT `LinkStat_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClickLog` ADD CONSTRAINT `ClickLog_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
