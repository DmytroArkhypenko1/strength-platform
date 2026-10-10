import { Controller, Get, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service.js';
import { FindExercisesDto } from './dto/find-exercises.dto.js';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@Query() query: FindExercisesDto) {
    return this.exercisesService.findAll(query);
  }
}