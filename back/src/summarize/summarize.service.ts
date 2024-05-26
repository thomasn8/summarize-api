import { Injectable } from '@nestjs/common';
import { RequestDto } from './dto/request.dto';

@Injectable()
export class SummarizeService {
  async getSummary(request: RequestDto): Promise<string> {
    return JSON.stringify(request);
  }
}
