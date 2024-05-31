import { Module } from '@nestjs/common';
import { SummarizeController } from './summarize/summarize.controller';
import { SummarizeService } from './summarize/summarize.service';

@Module({
  imports: [],
  controllers: [SummarizeController],
  providers: [SummarizeService]
})
export class AppModule {}
