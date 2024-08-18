-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auth0_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organization` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `favorites` JSON NULL,
    `eventsPostedId` JSON NULL,

    UNIQUE INDEX `users_auth0_id_key`(`auth0_id`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `locale` VARCHAR(191) NULL,
    `images` JSON NOT NULL,
    `salesStart` DATETIME(3) NOT NULL,
    `salesEnd` DATETIME(3) NOT NULL,
    `localDate` DATETIME(3) NULL,
    `localTime` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `statusCode` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `price` INTEGER NULL,
    `no_of_tickets` INTEGER NULL,
    `postedById` VARCHAR(191) NULL,
    `classifications` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venues` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `location` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `no_of_tickets` INTEGER NULL,
    `total_price` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
