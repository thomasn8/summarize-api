import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Summaries } from '../types/summarize.types';

export class ResponseDto {
  @IsNotEmpty()
  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  summaries?: Summaries[];

  @IsNotEmpty()
  errors: string[];
}
