import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { WeightRecordsModule } from './weight-records/weight-records.module.js';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    ProfileModule, 
    WeightRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}