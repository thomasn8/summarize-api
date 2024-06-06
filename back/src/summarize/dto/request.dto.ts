import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator';

export class RequestDto {
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3])
  details: number;

  @IsOptional()
  @IsNumber()
  @Max(10000)
  @Min(0)
  length?: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['english', 'french'])
  language: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  expertise?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  directive?: string;

  @IsNotEmpty()
  @IsString()
  urls: string;
}
