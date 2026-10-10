-- CreateTable
CREATE TABLE `UserProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `heightCm` DECIMAL(5, 2) NULL,
    `dateOfBirth` DATE NULL,
    `sex` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `unitSystem` ENUM('METRIC', 'IMPERIAL') NOT NULL DEFAULT 'METRIC',
    `activityLevel` ENUM('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE') NULL,
    `trainingExperience` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NULL,
    `primaryGoal` ENUM('MUSCLE_BUILDING', 'STRENGTH', 'BODY_RECOMPOSITION') NULL,
    `weightGoal` ENUM('GAIN', 'MAINTAIN', 'LOSE') NULL,
    `goalRate` ENUM('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE') NULL,
    `sessionsPerWeek` INTEGER NULL,
    `sessionDurationMinutes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeightRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `weightKg` DECIMAL(5, 2) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WeightRecord_userId_recordedAt_idx`(`userId`, `recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `muscleGroup` VARCHAR(80) NULL,
    `equipment` VARCHAR(80) NULL,
    `description` TEXT NULL,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Exercise_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `source` ENUM('MANUAL', 'AI_GENERATED') NOT NULL DEFAULT 'MANUAL',
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkoutPlan_userId_isActive_idx`(`userId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planId` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `dayOfWeek` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PlanDay_planId_sortOrder_idx`(`planId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanExercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planDayId` INTEGER NOT NULL,
    `exerciseId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `targetSets` INTEGER NOT NULL DEFAULT 3,
    `targetRepsMin` INTEGER NOT NULL DEFAULT 8,
    `targetRepsMax` INTEGER NOT NULL DEFAULT 12,
    `targetWeightKg` DECIMAL(7, 2) NULL,
    `restSeconds` INTEGER NULL,
    `targetRpe` DECIMAL(3, 1) NULL,
    `targetRir` DECIMAL(3, 1) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PlanExercise_planDayId_sortOrder_idx`(`planDayId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanSet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planExerciseId` INTEGER NOT NULL,
    `setNumber` INTEGER NOT NULL,
    `setType` ENUM('WARMUP', 'WORKING', 'DROP', 'FAILURE') NOT NULL DEFAULT 'WORKING',
    `targetReps` INTEGER NULL,
    `targetWeightKg` DECIMAL(7, 2) NULL,
    `targetRpe` DECIMAL(3, 1) NULL,
    `targetRir` DECIMAL(3, 1) NULL,

    UNIQUE INDEX `PlanSet_planExerciseId_setNumber_key`(`planExerciseId`, `setNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `planDayId` INTEGER NULL,
    `name` VARCHAR(150) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkoutSession_userId_startedAt_idx`(`userId`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutSet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `exerciseId` INTEGER NOT NULL,
    `setNumber` INTEGER NOT NULL,
    `setType` ENUM('WARMUP', 'WORKING', 'DROP', 'FAILURE') NOT NULL DEFAULT 'WORKING',
    `weightKg` DECIMAL(7, 2) NOT NULL,
    `reps` INTEGER NOT NULL,
    `rpe` DECIMAL(3, 1) NULL,
    `rir` DECIMAL(3, 1) NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(255) NULL,

    INDEX `WorkoutSet_sessionId_exerciseId_idx`(`sessionId`, `exerciseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeightRecord` ADD CONSTRAINT `WeightRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutPlan` ADD CONSTRAINT `WorkoutPlan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanDay` ADD CONSTRAINT `PlanDay_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `WorkoutPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanExercise` ADD CONSTRAINT `PlanExercise_planDayId_fkey` FOREIGN KEY (`planDayId`) REFERENCES `PlanDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanExercise` ADD CONSTRAINT `PlanExercise_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanSet` ADD CONSTRAINT `PlanSet_planExerciseId_fkey` FOREIGN KEY (`planExerciseId`) REFERENCES `PlanExercise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutSession` ADD CONSTRAINT `WorkoutSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutSet` ADD CONSTRAINT `WorkoutSet_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `WorkoutSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutSet` ADD CONSTRAINT `WorkoutSet_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
