import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { SetType } from '../../generated/prisma/client.js';

export class UpdatePlanSetDto {
  @IsOptional()
  @IsEnum(SetType)
  setType?: SetType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  targetReps?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(2000)
  targetWeightKg?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(10)
  targetRpe?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  targetRir?: number;
}