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
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto.js';
import { WorkoutSessionsService } from './workout-sessions.service.js';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto.js';
import { CompleteWorkoutSessionDto } from './dto/complete-workout-session.dto.js';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto.js';

type AuthenticatedRequest = Request & {
  user: { userId: number; email: string };
};

@UseGuards(JwtAuthGuard)
@Controller('workout-sessions')
export class WorkoutSessionsController {
  constructor(
    private readonly workoutSessionsService: WorkoutSessionsService,
  ) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWorkoutSessionDto,
  ) {
    return this.workoutSessionsService.create(
      req.user.userId,
      dto,
    );
  }

  @Post(':sessionId/sets')
  addSet(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: CreateWorkoutSetDto,
  ) {
    return this.workoutSessionsService.addSet(
      req.user.userId,
      sessionId,
      dto,
    );
  }

  @Patch(':sessionId/sets/:setId')
  updateSet(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateWorkoutSetDto,
  ) {
    return this.workoutSessionsService.updateSet(
      req.user.userId,
      sessionId,
      setId,
      dto,
    );
  }

  @Delete(':sessionId/sets/:setId')
  removeSet(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('setId', ParseIntPipe) setId: number,
  ) {
    return this.workoutSessionsService.removeSet(
      req.user.userId,
      sessionId,
      setId,
    );
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.workoutSessionsService.findAll(req.user.userId);
  }

  @Get(':sessionId')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.workoutSessionsService.findOne(
      req.user.userId,
      sessionId,
    );
  }

  @Patch(':sessionId/complete')
  complete(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: CompleteWorkoutSessionDto,
  ) {
    return this.workoutSessionsService.complete(
      req.user.userId,
      sessionId,
      dto,
    );
  }
}