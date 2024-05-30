import { Injectable } from '@nestjs/common';
import { RequestDto } from './dto/request.dto';

@Injectable()
export class SummarizeService {
  async getSummary(request: RequestDto): Promise<string> {
    // code here ...

    // parse request.urls

    // scrap web pages content
    // (Cheerio if only manipulate the dom, Pupeeter can runs javascript to simulate a browser)
    // get metadatas
    // if not video, get content
    // else, get translations

    // get summaries with chatgpt

    // if more than 1 links merge summaries in one summary

    // return summary

    return JSON.stringify(request);
  }
}
