import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

interface Summaries {
  url: string;
  summary?: string;
  errors?: string[];
}

export class ResponseDto {
  @IsNotEmpty()
  @IsString()
  summary: string;

  @IsOptional()
  @IsArray()
  summaries: Summaries[];
}
