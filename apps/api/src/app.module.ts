import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { WeightRecordsModule } from './weight-records/weight-records.module.js';
import { ExercisesModule } from './exercises/exercises.module.js';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module.js';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module.js';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    ProfileModule, 
    WeightRecordsModule,
    ExercisesModule,
    WorkoutPlansModule,
    WorkoutSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}