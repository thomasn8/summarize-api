import { HttpException, HttpStatus } from '@nestjs/common';
import { RequestDto } from '../dto/request.dto';
import { Chat } from '../types/summarize.types';
import OpenAI from 'openai';

export async function getOpenaiInstance(request: RequestDto): Promise<Chat> {
  try {
    const openai = new OpenAI({
      apiKey: request.apiKey
    });

    const model = request.model.substring('openai-'.length);

    await openai.models.retrieve(model);

    return {
      openai: openai,
      model: model as OpenAI.Chat.ChatModel,
      askLlm: askChatGpt
    };
  } catch (error) {
    throw new HttpException(
      'Impossible to get OpenAI instance: ' + error.error.message,
      HttpStatus.BAD_REQUEST
    );
  }
}

export async function askChatGpt(
  chat: Chat,
  systemMessage: string,
  userMessage: string
): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ];

  const chatCompletion = await chat.openai.chat.completions.create({
    messages: messages,
    model: chat.model
  });

  return chatCompletion.choices[0].message.content;
}
