/*
  Warnings:

  - A unique constraint covering the columns `[planId,sortOrder]` on the table `PlanDay` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planId,dayOfWeek]` on the table `PlanDay` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planDayId,sortOrder]` on the table `PlanExercise` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `PlanDay` DROP FOREIGN KEY `PlanDay_planId_fkey`;

-- DropForeignKey
ALTER TABLE `PlanExercise` DROP FOREIGN KEY `PlanExercise_planDayId_fkey`;

-- DropIndex
DROP INDEX `PlanDay_planId_sortOrder_idx` ON `PlanDay`;

-- DropIndex
DROP INDEX `PlanExercise_planDayId_sortOrder_idx` ON `PlanExercise`;

-- CreateIndex
CREATE UNIQUE INDEX `PlanDay_planId_sortOrder_key` ON `PlanDay`(`planId`, `sortOrder`);

-- CreateIndex
CREATE UNIQUE INDEX `PlanDay_planId_dayOfWeek_key` ON `PlanDay`(`planId`, `dayOfWeek`);

-- CreateIndex
CREATE UNIQUE INDEX `PlanExercise_planDayId_sortOrder_key` ON `PlanExercise`(`planDayId`, `sortOrder`);

-- Restore foreign keys required while replacing child-table indexes
ALTER TABLE `PlanDay`
  ADD CONSTRAINT `PlanDay_planId_fkey`
  FOREIGN KEY (`planId`) REFERENCES `WorkoutPlan`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PlanExercise`
  ADD CONSTRAINT `PlanExercise_planDayId_fkey`
  FOREIGN KEY (`planDayId`) REFERENCES `PlanDay`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;