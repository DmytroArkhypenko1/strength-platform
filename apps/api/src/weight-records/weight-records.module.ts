import { Module } from '@nestjs/common';
import { WeightRecordsController } from './weight-records.controller.js';
import { WeightRecordsService } from './weight-records.service.js';

@Module({
  controllers: [WeightRecordsController],
  providers: [WeightRecordsService],
})
export class WeightRecordsModule {}