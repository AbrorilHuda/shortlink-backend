-- CreateTable
CREATE TABLE `Link` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `originalUrl` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiredAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Link_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LinkStat` (
    `linkId` BIGINT NOT NULL,
    `totalClicks` INTEGER NOT NULL DEFAULT 0,
    `lastClickedAt` DATETIME(3) NULL,

    PRIMARY KEY (`linkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClickLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `linkId` BIGINT NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LinkStat` ADD CONSTRAINT `LinkStat_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClickLog` ADD CONSTRAINT `ClickLog_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
