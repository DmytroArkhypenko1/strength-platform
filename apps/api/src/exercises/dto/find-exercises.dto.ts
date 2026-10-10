import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FindExercisesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}