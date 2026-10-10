import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertProfileDto } from './dto/upsert-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: number) {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async upsert(userId: number, dto: UpsertProfileDto) {
    const { dateOfBirth, ...profileData } = dto;

    return this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
        ...(dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dateOfBirth) }
          : {}),
      },
      update: {
        ...profileData,
        ...(dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dateOfBirth) }
          : {}),
      },
    });
  }
}