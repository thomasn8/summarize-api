import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SummarizeController } from './summarize/summarize.controller';
import { SummarizeService } from './summarize/summarize.service';

@Module({
  imports: [],
  controllers: [AppController, SummarizeController],
  providers: [AppService, SummarizeService]
})
export class AppModule {}
