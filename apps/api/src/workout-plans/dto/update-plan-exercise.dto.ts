import {
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdatePlanExerciseDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  targetSets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  targetRepsMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  targetRepsMax?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  targetWeightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1800)
  restSeconds?: number;

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