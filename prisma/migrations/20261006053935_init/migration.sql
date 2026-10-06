-- CreateTable
CREATE TABLE `foods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `emoji` VARCHAR(10) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `estimated_price_per_person` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `moods` TEXT NOT NULL,
    `tags` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
