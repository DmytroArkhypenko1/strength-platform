import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  Prisma,
  SetType,
} from '../generated/prisma/client.js';
import { CreatePlanDayDto } from './dto/create-plan-day.dto.js';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto.js';
import { CreatePlanExerciseDto } from './dto/create-plan-exercise.dto.js';
import { CreatePlanSetDto } from './dto/create-plan-set.dto.js';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto.js';
import { ReorderPlanDaysDto } from './dto/reorder-plan-days.dto.js';
import { ReorderPlanExercisesDto } from './dto/reorder-plan-exercises.dto.js';
import { UpdatePlanExerciseDto } from './dto/update-plan-exercise.dto.js';
import { UpdatePlanDayDto } from './dto/update-plan-day.dto.js';
import { UpdatePlanSetDto } from './dto/update-plan-set.dto.js';

@Injectable()
export class WorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: number) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            days: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOneByUser(userId: number, planId: number) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        userId,
      },
      include: {
        days: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            exercises: {
              orderBy: {
                sortOrder: 'asc',
              },
              include: {
                exercise: true,
                sets: {
                  orderBy: {
                    setNumber: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    return plan;
  }

  create(userId: number, dto: CreateWorkoutPlanDto) {
    return this.prisma.workoutPlan.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async update(
    userId: number,
    planId: number,
    dto: UpdateWorkoutPlanDto,
  ) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    return this.prisma.workoutPlan.update({
      where: {
        id: planId,
      },
      data: dto,
    });
  }

  async remove(userId: number, planId: number) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        userId,
      },
      select: {
        id: true,
        days: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const dayIds = plan.days.map((day) => day.id);

      if (dayIds.length > 0) {
        await tx.workoutSession.updateMany({
          where: {
            userId,
            planDayId: {
              in: dayIds,
            },
          },
          data: {
            planDayId: null,
          },
        });
      }

      await tx.workoutPlan.delete({
        where: {
          id: plan.id,
        },
      });

      return {
        deletedPlanId: plan.id,
      };
    });
  }

  async activate(userId: number, planId: number) {
    return this.prisma.$transaction(async (transaction) => {
      const plan = await transaction.workoutPlan.findFirst({
        where: {
          id: planId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!plan) {
        throw new NotFoundException('Workout plan not found');
      }

      await transaction.workoutPlan.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return transaction.workoutPlan.update({
        where: {
          id: planId,
        },
        data: {
          isActive: true,
        },
      });
    });
  }

  async createDay(
    userId: number,
    planId: number,
    dto: CreatePlanDayDto,
  ) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const plan = await transaction.workoutPlan.findFirst({
          where: {
            id: planId,
            userId,
          },
          select: {
            id: true,
          },
        });

        if (!plan) {
          throw new NotFoundException('Workout plan not found');
        }

        const lastDay = await transaction.planDay.findFirst({
          where: {
            planId,
          },
          orderBy: {
            sortOrder: 'desc',
          },
          select: {
            sortOrder: true,
          },
        });

        return transaction.planDay.create({
          data: {
            planId,
            name: dto.name,
            dayOfWeek: dto.dayOfWeek,
            sortOrder: (lastDay?.sortOrder ?? 0) + 1,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A plan day already uses this calendar day or position',
        );
      }

      throw error;
    }
  }

  async updateDay(
    userId: number,
    planId: number,
    dayId: number,
    dto: UpdatePlanDayDto,
  ) {
    const planDay = await this.prisma.planDay.findFirst({
      where: {
        id: dayId,
        planId,
        plan: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!planDay) {
      throw new NotFoundException('Workout plan day not found');
    }

    if (dto.dayOfWeek !== undefined) {
      const conflictingDay = await this.prisma.planDay.findFirst({
        where: {
          planId,
          dayOfWeek: dto.dayOfWeek,
          NOT: {
            id: dayId,
          },
        },
        select: {
          id: true,
        },
      });

      if (conflictingDay) {
        throw new ConflictException(
          'A workout plan day already exists for this day of week',
        );
      }
    }

    return this.prisma.planDay.update({
      where: {
        id: planDay.id,
      },
      data: dto,
    });
  }

  async removeDay(
    userId: number,
    planId: number,
    dayId: number,
  ) {
    const planDay = await this.prisma.planDay.findFirst({
      where: {
        id: dayId,
        planId,
        plan: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!planDay) {
      throw new NotFoundException('Workout plan day not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workoutSession.updateMany({
        where: {
          userId,
          planDayId: planDay.id,
        },
        data: {
          planDayId: null,
        },
      });

      await tx.planDay.delete({
        where: {
          id: planDay.id,
        },
      });

      const remainingDays = await tx.planDay.findMany({
        where: {
          planId,
        },
        orderBy: {
          sortOrder: 'asc',
        },
        select: {
          id: true,
        },
      });

      await Promise.all(
        remainingDays.map((day, index) =>
          tx.planDay.update({
            where: {
              id: day.id,
            },
            data: {
              sortOrder: -(index + 1),
            },
          }),
        ),
      );

      await Promise.all(
        remainingDays.map((day, index) =>
          tx.planDay.update({
            where: {
              id: day.id,
            },
            data: {
              sortOrder: index + 1,
            },
          }),
        ),
      );

      return {
        deletedDayId: planDay.id,
      };
    });
  }

  async reorderDays(
    userId: number,
    planId: number,
    dto: ReorderPlanDaysDto,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const plan = await transaction.workoutPlan.findFirst({
        where: {
          id: planId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!plan) {
        throw new NotFoundException('Workout plan not found');
      }

      const days = await transaction.planDay.findMany({
        where: {
          planId,
        },
        select: {
          id: true,
        },
      });

      const existingIds = new Set(days.map((day) => day.id));
      const requestedIds = new Set(dto.dayIds);

      const containsExactlyPlanDays =
        existingIds.size === requestedIds.size &&
        [...requestedIds].every((dayId) => existingIds.has(dayId));

      if (!containsExactlyPlanDays) {
        throw new BadRequestException(
          'dayIds must contain every day in this workout plan exactly once',
        );
      }

      await Promise.all(
        dto.dayIds.map((dayId, index) =>
          transaction.planDay.update({
            where: {
              id: dayId,
            },
            data: {
              sortOrder: -(index + 1),
            },
          }),
        ),
      );

      await Promise.all(
        dto.dayIds.map((dayId, index) =>
          transaction.planDay.update({
            where: {
              id: dayId,
            },
            data: {
              sortOrder: index + 1,
            },
          }),
        ),
      );

      return transaction.planDay.findMany({
        where: {
          planId,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });
    });
  }

  async createExercise(
    userId: number,
    planId: number,
    dayId: number,
    dto: CreatePlanExerciseDto,
  ) {
    const targetRepsMin = dto.targetRepsMin ?? 8;
    const targetRepsMax = dto.targetRepsMax ?? 12;

    if (targetRepsMin > targetRepsMax) {
      throw new BadRequestException(
        'targetRepsMin must not be greater than targetRepsMax',
      );
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const planDay = await transaction.planDay.findFirst({
          where: {
            id: dayId,
            plan: {
              id: planId,
              userId,
            },
          },
          select: {
            id: true,
          },
        });

        if (!planDay) {
          throw new NotFoundException('Workout plan day not found');
        }

        const exercise = await transaction.exercise.findUnique({
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

        const lastExercise = await transaction.planExercise.findFirst({
          where: {
            planDayId: dayId,
          },
          orderBy: {
            sortOrder: 'desc',
          },
          select: {
            sortOrder: true,
          },
        });

        return transaction.planExercise.create({
          data: {
            planDayId: dayId,
            exerciseId: dto.exerciseId,
            sortOrder: (lastExercise?.sortOrder ?? 0) + 1,
            targetSets: dto.targetSets ?? 3,
            targetRepsMin,
            targetRepsMax,
            targetWeightKg: dto.targetWeightKg,
            restSeconds: dto.restSeconds,
            targetRpe: dto.targetRpe,
            targetRir: dto.targetRir,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A plan exercise already uses this position',
        );
      }

      throw error;
    }
  }

  async updateExercise(
    userId: number,
    planId: number,
    dayId: number,
    planExerciseId: number,
    dto: UpdatePlanExerciseDto,
  ) {
    const planExercise = await this.prisma.planExercise.findFirst({
      where: {
        id: planExerciseId,
        planDay: {
          id: dayId,
          plan: {
            id: planId,
            userId,
          },
        },
      },
      select: {
        id: true,
        targetRepsMin: true,
        targetRepsMax: true,
      },
    });

    if (!planExercise) {
      throw new NotFoundException('Plan exercise not found');
    }

    const targetRepsMin =
      dto.targetRepsMin ?? planExercise.targetRepsMin;
    const targetRepsMax =
      dto.targetRepsMax ?? planExercise.targetRepsMax;

    if (targetRepsMin > targetRepsMax) {
      throw new BadRequestException(
        'targetRepsMin must not be greater than targetRepsMax',
      );
    }

    return this.prisma.planExercise.update({
      where: {
        id: planExerciseId,
      },
      data: dto,
    });
  }

  async removeExercise(
    userId: number,
    planId: number,
    dayId: number,
    planExerciseId: number,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const planExercise = await transaction.planExercise.findFirst({
        where: {
          id: planExerciseId,
          planDay: {
            id: dayId,
            plan: {
              id: planId,
              userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!planExercise) {
        throw new NotFoundException('Plan exercise not found');
      }

      await transaction.planExercise.delete({
        where: {
          id: planExerciseId,
        },
      });

      const remainingExercises = await transaction.planExercise.findMany({
        where: {
          planDayId: dayId,
        },
        select: {
          id: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      await Promise.all(
        remainingExercises.map((exercise, index) =>
          transaction.planExercise.update({
            where: {
              id: exercise.id,
            },
            data: {
              sortOrder: -(index + 1),
            },
          }),
        ),
      );

      await Promise.all(
        remainingExercises.map((exercise, index) =>
          transaction.planExercise.update({
            where: {
              id: exercise.id,
            },
            data: {
              sortOrder: index + 1,
            },
          }),
        ),
      );

      return {
        id: planExerciseId,
      };
    });
  }

  async reorderExercises(
    userId: number,
    planId: number,
    dayId: number,
    dto: ReorderPlanExercisesDto,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const planDay = await transaction.planDay.findFirst({
        where: {
          id: dayId,
          plan: {
            id: planId,
            userId,
          },
        },
        select: {
          id: true,
        },
      });

      if (!planDay) {
        throw new NotFoundException('Workout plan day not found');
      }

      const exercises = await transaction.planExercise.findMany({
        where: {
          planDayId: dayId,
        },
        select: {
          id: true,
        },
      });

      const existingIds = new Set(exercises.map((exercise) => exercise.id));
      const requestedIds = new Set(dto.planExerciseIds);

      const containsExactlyDayExercises =
        existingIds.size === requestedIds.size &&
        [...requestedIds].every((exerciseId) =>
          existingIds.has(exerciseId),
        );

      if (!containsExactlyDayExercises) {
        throw new BadRequestException(
          'planExerciseIds must contain every exercise in this plan day exactly once',
        );
      }

      await Promise.all(
        dto.planExerciseIds.map((planExerciseId, index) =>
          transaction.planExercise.update({
            where: {
              id: planExerciseId,
            },
            data: {
              sortOrder: -(index + 1),
            },
          }),
        ),
      );

      await Promise.all(
        dto.planExerciseIds.map((planExerciseId, index) =>
          transaction.planExercise.update({
            where: {
              id: planExerciseId,
            },
            data: {
              sortOrder: index + 1,
            },
          }),
        ),
      );

      return transaction.planExercise.findMany({
        where: {
          planDayId: dayId,
        },
        include: {
          exercise: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });
    });
  }

  async createSet(
    userId: number,
    planId: number,
    dayId: number,
    planExerciseId: number,
    dto: CreatePlanSetDto,
  ) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const planExercise = await transaction.planExercise.findFirst({
          where: {
            id: planExerciseId,
            planDay: {
              id: dayId,
              plan: {
                id: planId,
                userId,
              },
            },
          },
          select: {
            id: true,
          },
        });

        if (!planExercise) {
          throw new NotFoundException('Plan exercise not found');
        }

        const lastSet = await transaction.planSet.findFirst({
          where: {
            planExerciseId,
          },
          orderBy: {
            setNumber: 'desc',
          },
          select: {
            setNumber: true,
          },
        });

        return transaction.planSet.create({
          data: {
            planExerciseId,
            setNumber: (lastSet?.setNumber ?? 0) + 1,
            setType: dto.setType ?? SetType.WORKING,
            targetReps: dto.targetReps,
            targetWeightKg: dto.targetWeightKg,
            targetRpe: dto.targetRpe,
            targetRir: dto.targetRir,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A plan set already uses this position',
        );
      }

      throw error;
    }
  }

  async updatePlanSet(
    userId: number,
    planId: number,
    dayId: number,
    planExerciseId: number,
    planSetId: number,
    dto: UpdatePlanSetDto,
  ) {
    const planSet = await this.prisma.planSet.findFirst({
      where: {
        id: planSetId,
        planExerciseId,
        planExercise: {
          planDayId: dayId,
          planDay: {
            planId,
            plan: {
              userId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!planSet) {
      throw new NotFoundException('Workout plan set not found');
    }

    return this.prisma.planSet.update({
      where: {
        id: planSet.id,
      },
      data: dto,
    });
  }

  async removePlanSet(
    userId: number,
    planId: number,
    dayId: number,
    planExerciseId: number,
    planSetId: number,
  ) {
    const planSet = await this.prisma.planSet.findFirst({
      where: {
        id: planSetId,
        planExerciseId,
        planExercise: {
          planDayId: dayId,
          planDay: {
            planId,
            plan: {
              userId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!planSet) {
      throw new NotFoundException('Workout plan set not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.planSet.delete({
        where: {
          id: planSet.id,
        },
      });

      const remainingSets = await tx.planSet.findMany({
        where: {
          planExerciseId,
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
          tx.planSet.update({
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
          tx.planSet.update({
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
        deletedPlanSetId: planSet.id,
      };
    });
  }
}