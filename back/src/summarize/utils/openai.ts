import { HttpException, HttpStatus } from '@nestjs/common';
import { RequestDto } from '../dto/request.dto';
import { Chat } from '../types/summarize.types';
import OpenAI from 'openai';

export async function getOpenAiInstance(request: RequestDto): Promise<Chat> {
  try {
    const openai = new OpenAI({
      apiKey: request.apiKey
    });

    // This is used to test if the model name exist (doesn't give informations about the token context window)
    await openai.models.retrieve(request.model);

    // TODO: find a way to get openai model context
    const contextWindow = request.model.startsWith('gpt-3.5-turbo')
      ? 16385
      : 4096;

    return {
      openai: openai,
      contextWindow: contextWindow,
      model: request.model as OpenAI.Chat.ChatModel
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
