import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min
} from 'class-validator';

export class RequestDto {
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Max(2000)
  @Min(20)
  length: number;

  @IsNotEmpty()
  @IsString()
  expertise: string;

  @IsNotEmpty()
  @IsString()
  directive: string;

  @IsNotEmpty()
  @IsString()
  urls: string;
}
