/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,exerciseId,setNumber]` on the table `WorkoutSet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `WorkoutSet_sessionId_exerciseId_setNumber_key` ON `WorkoutSet`(`sessionId`, `exerciseId`, `setNumber`);
