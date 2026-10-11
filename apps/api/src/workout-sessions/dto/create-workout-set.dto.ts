import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SetType } from '../../generated/prisma/client.js';

export class CreateWorkoutSetDto {
  @IsInt()
  @Min(1)
  exerciseId: number;

  @IsInt()
  @Min(1)
  setNumber: number;

  @IsOptional()
  @IsEnum(SetType)
  setType?: SetType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(2000)
  weightKg: number;

  @IsInt()
  @Min(1)
  @Max(100)
  reps: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  rir?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}