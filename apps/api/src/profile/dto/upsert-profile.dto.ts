import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  ActivityLevel,
  GoalRate,
  PrimaryGoal,
  Sex,
  TrainingExperience,
  UnitSystem,
  WeightGoal,
} from '../../generated/prisma/client.js';

export class UpsertProfileDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsEnum(UnitSystem)
  unitSystem?: UnitSystem;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsEnum(TrainingExperience)
  trainingExperience?: TrainingExperience;

  @IsOptional()
  @IsEnum(PrimaryGoal)
  primaryGoal?: PrimaryGoal;

  @IsOptional()
  @IsEnum(WeightGoal)
  weightGoal?: WeightGoal;

  @IsOptional()
  @IsEnum(GoalRate)
  goalRate?: GoalRate;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  sessionsPerWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  sessionDurationMinutes?: number;
}