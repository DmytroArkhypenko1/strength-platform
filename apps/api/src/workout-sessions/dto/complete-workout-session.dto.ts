import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CompleteWorkoutSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}