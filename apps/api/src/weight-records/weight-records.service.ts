import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto.js';

@Injectable()
export class WeightRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: number) {
    return this.prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  create(userId: number, dto: CreateWeightRecordDto) {
    const { recordedAt, ...recordData } = dto;

    return this.prisma.weightRecord.create({
      data: {
        userId,
        ...recordData,
        ...(recordedAt !== undefined
          ? { recordedAt: new Date(recordedAt) }
          : {}),
      },
    });
  }
}