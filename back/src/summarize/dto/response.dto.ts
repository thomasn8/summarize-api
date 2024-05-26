import { IsNotEmpty, IsString } from 'class-validator';

export class ResponseDto {
  @IsNotEmpty()
  @IsString()
  summary: string;
}
