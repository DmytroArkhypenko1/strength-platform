import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FindExercisesDto } from './dto/find-exercises.dto.js';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: FindExercisesDto) {
    const search = query.search?.trim();

    return this.prisma.exercise.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }
}