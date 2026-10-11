import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto.js';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto.js';
import { CompleteWorkoutSessionDto } from './dto/complete-workout-session.dto.js';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto.js';

@Injectable()
export class WorkoutSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    dto: CreateWorkoutSessionDto,
  ) {
    let name = dto.name;

    if (dto.planDayId !== undefined) {
      const planDay = await this.prisma.planDay.findFirst({
        where: {
          id: dto.planDayId,
          plan: {
            userId,
          },
        },
        select: {
          name: true,
        },
      });

      if (!planDay) {
        throw new NotFoundException('Workout plan day not found');
      }

      name ??= planDay.name;
    }

    if (!name) {
      throw new BadRequestException(
        'name is required when planDayId is not provided',
      );
    }

    return this.prisma.workoutSession.create({
      data: {
        userId,
        planDayId: dto.planDayId,
        name,
      },
    });
  }

  async addSet(
    userId: number,
    sessionId: number,
    dto: CreateWorkoutSetDto,
  ) {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        completedAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.completedAt) {
      throw new BadRequestException(
        'Cannot add sets to a completed workout session',
      );
    }

    const exercise = await this.prisma.exercise.findUnique({
      where: {
        id: dto.exerciseId,
      },
      select: {
        id: true,
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const existingSet = await this.prisma.workoutSet.findUnique({
      where: {
        sessionId_exerciseId_setNumber: {
          sessionId,
          exerciseId: dto.exerciseId,
          setNumber: dto.setNumber,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingSet) {
      throw new ConflictException(
        'A set with this number already exists for this exercise',
      );
    }

    return this.prisma.workoutSet.create({
      data: {
        sessionId,
        exerciseId: dto.exerciseId,
        setNumber: dto.setNumber,
        setType: dto.setType,
        weightKg: dto.weightKg,
        reps: dto.reps,
        rpe: dto.rpe,
        rir: dto.rir,
        notes: dto.notes,
      },
      include: {
        exercise: true,
      },
    });
  }

  async updateSet(
    userId: number,
    sessionId: number,
    setId: number,
    dto: UpdateWorkoutSetDto,
  ) {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        completedAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.completedAt) {
      throw new BadRequestException(
        'Cannot update sets in a completed workout session',
      );
    }

    const workoutSet = await this.prisma.workoutSet.findFirst({
      where: {
        id: setId,
        sessionId,
      },
      select: {
        id: true,
      },
    });

    if (!workoutSet) {
      throw new NotFoundException('Workout set not found');
    }

    return this.prisma.workoutSet.update({
      where: {
        id: workoutSet.id,
      },
      data: dto,
      include: {
        exercise: true,
      },
    });
  }

  async removeSet(
    userId: number,
    sessionId: number,
    setId: number,
  ) {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        completedAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.completedAt) {
      throw new BadRequestException(
        'Cannot delete sets from a completed workout session',
      );
    }

    const workoutSet = await this.prisma.workoutSet.findFirst({
      where: {
        id: setId,
        sessionId,
      },
      select: {
        id: true,
        exerciseId: true,
      },
    });

    if (!workoutSet) {
      throw new NotFoundException('Workout set not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workoutSet.delete({
        where: {
          id: workoutSet.id,
        },
      });

      const remainingSets = await tx.workoutSet.findMany({
        where: {
          sessionId,
          exerciseId: workoutSet.exerciseId,
        },
        orderBy: {
          setNumber: 'asc',
        },
        select: {
          id: true,
        },
      });

      await Promise.all(
        remainingSets.map((set, index) =>
          tx.workoutSet.update({
            where: {
              id: set.id,
            },
            data: {
              setNumber: -(index + 1),
            },
          }),
        ),
      );

      await Promise.all(
        remainingSets.map((set, index) =>
          tx.workoutSet.update({
            where: {
              id: set.id,
            },
            data: {
              setNumber: index + 1,
            },
          }),
        ),
      );

      return {
        deletedSetId: workoutSet.id,
      };
    });
  }

  async findOne(userId: number, sessionId: number) {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sets: {
          orderBy: [
            { exerciseId: 'asc' },
            { setNumber: 'asc' },
          ],
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    return session;
  }

  findAll(userId: number) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        _count: {
          select: {
            sets: true,
          },
        },
      },
    });
  }

  async complete(
    userId: number,
    sessionId: number,
    dto: CompleteWorkoutSessionDto,
  ) {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        completedAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.completedAt) {
      throw new BadRequestException('Workout session is already completed');
    }

    return this.prisma.workoutSession.update({
      where: {
        id: session.id,
      },
      data: {
        completedAt: new Date(),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
  }
}