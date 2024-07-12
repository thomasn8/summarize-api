import { Body, Controller, Post } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { RequestDto } from './dto/request.dto';
import { ResponseDto } from './dto/response.dto';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  public async summarize(@Body() request: RequestDto): Promise<ResponseDto> {
    return await this.summarizeService.summarize(request);
  }
}
