import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto.js';
import { CreatePlanDayDto } from './dto/create-plan-day.dto.js';
import { WorkoutPlansService } from './workout-plans.service.js';
import { CreatePlanExerciseDto } from './dto/create-plan-exercise.dto.js';
import { CreatePlanSetDto } from './dto/create-plan-set.dto.js';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto.js';
import { ReorderPlanDaysDto } from './dto/reorder-plan-days.dto.js';
import { ReorderPlanExercisesDto } from './dto/reorder-plan-exercises.dto.js';
import { UpdatePlanExerciseDto } from './dto/update-plan-exercise.dto.js';

type AuthenticatedRequest = Request & {
  user: { userId: number; email: string };
};

@UseGuards(JwtAuthGuard)
@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(
    private readonly workoutPlansService: WorkoutPlansService,
  ) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.workoutPlansService.findAllByUser(req.user.userId);
  }

  @Get(':planId')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
  ) {
    return this.workoutPlansService.findOneByUser(
      req.user.userId,
      planId,
    );
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.create(req.user.userId, dto);
  }

  @Post(':planId/days')
  createDay(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() dto: CreatePlanDayDto,
  ) {
    return this.workoutPlansService.createDay(
      req.user.userId,
      planId,
      dto,
    );
  }

  @Patch(':planId')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() dto: UpdateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.update(
      req.user.userId,
      planId,
      dto,
    );
  }

  @Post(':planId/activate')
  activate(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
  ) {
    return this.workoutPlansService.activate(
      req.user.userId,
      planId,
    );
  }

  @Patch(':planId/days/order')
  reorderDays(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() dto: ReorderPlanDaysDto,
  ) {
    return this.workoutPlansService.reorderDays(
      req.user.userId,
      planId,
      dto,
    );
  }

  @Patch(':planId/days/:dayId/exercises/order')
  reorderExercises(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() dto: ReorderPlanExercisesDto,
  ) {
    return this.workoutPlansService.reorderExercises(
      req.user.userId,
      planId,
      dayId,
      dto,
    );
  }

  @Post(':planId/days/:dayId/exercises')
  createExercise(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() dto: CreatePlanExerciseDto,
  ) {
    return this.workoutPlansService.createExercise(
      req.user.userId,
      planId,
      dayId,
      dto,
    );
  }

  @Patch(':planId/days/:dayId/exercises/:planExerciseId')
  updateExercise(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Param('planExerciseId', ParseIntPipe) planExerciseId: number,
    @Body() dto: UpdatePlanExerciseDto,
  ) {
    return this.workoutPlansService.updateExercise(
      req.user.userId,
      planId,
      dayId,
      planExerciseId,
      dto,
    );
  }

  @Delete(':planId/days/:dayId/exercises/:planExerciseId')
  removeExercise(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Param('planExerciseId', ParseIntPipe) planExerciseId: number,
  ) {
    return this.workoutPlansService.removeExercise(
      req.user.userId,
      planId,
      dayId,
      planExerciseId,
    );
  }

  @Post(':planId/days/:dayId/exercises/:planExerciseId/sets')
  createSet(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Param('planExerciseId', ParseIntPipe) planExerciseId: number,
    @Body() dto: CreatePlanSetDto,
  ) {
    return this.workoutPlansService.createSet(
      req.user.userId,
      planId,
      dayId,
      planExerciseId,
      dto,
    );
  }
}