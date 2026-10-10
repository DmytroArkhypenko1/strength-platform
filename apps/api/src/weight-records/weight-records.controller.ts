import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto.js';
import { WeightRecordsService } from './weight-records.service.js';

type AuthenticatedRequest = Request & {
  user: { userId: number; email: string };
};

@UseGuards(JwtAuthGuard)
@Controller('weight-records')
export class WeightRecordsController {
  constructor(
    private readonly weightRecordsService: WeightRecordsService,
  ) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.weightRecordsService.findAllByUser(req.user.userId);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWeightRecordDto,
  ) {
    return this.weightRecordsService.create(req.user.userId, dto);
  }
}