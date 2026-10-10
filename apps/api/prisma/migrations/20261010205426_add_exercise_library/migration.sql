/*
  Warnings:

  - You are about to drop the column `isCustom` on the `Exercise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Exercise` DROP COLUMN `isCustom`;

-- CreateIndex
CREATE UNIQUE INDEX `Exercise_name_key` ON `Exercise`(`name`);

-- Seed canonical exercise library
INSERT INTO `Exercise` (
  `name`,
  `muscleGroup`,
  `equipment`,
  `description`,
  `createdAt`,
  `updatedAt`
) VALUES
  (
    'Barbell Back Squat',
    'Quadriceps',
    'Barbell',
    'A compound lower-body barbell squat.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
  ),
  (
    'Barbell Bench Press',
    'Chest',
    'Barbell',
    'A compound horizontal pressing exercise.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
  ),
  (
    'Conventional Deadlift',
    'Posterior Chain',
    'Barbell',
    'A compound hip-hinge strength exercise.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
  ),
  (
    'Barbell Overhead Press',
    'Shoulders',
    'Barbell',
    'A compound vertical pressing exercise.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
  ),
  (
    'Barbell Row',
    'Back',
    'Barbell',
    'A compound horizontal pulling exercise.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
  );