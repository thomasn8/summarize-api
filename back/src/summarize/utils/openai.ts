import { Chat } from '../types/summarize.types';
import OpenAI from 'openai';

export async function askChatGpt(
  chat: Chat,
  systemMessage: string,
  userMessage: string
): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ];

  // console.log(systemMessage);

  const chatCompletion = await chat.openai.chat.completions.create({
    messages: messages,
    model: chat.model
  });

  return chatCompletion.choices[0].message.content;
}
