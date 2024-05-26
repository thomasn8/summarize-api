import { Body, Controller, Post } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { RequestDto } from './dto/request.dto';

interface response {
  summary: string;
}

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  async getSummary(@Body() request: RequestDto): Promise<response> {
    return { summary: await this.summarizeService.getSummary(request) };
  }
}
