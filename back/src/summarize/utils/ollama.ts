import axios from 'axios';
import { Chat } from '../types/summarize.types';

export async function askLocalLlm(
  chat: Chat,
  systemMessage: string,
  userMessage: string
): Promise<string> {
  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ];

  const chatCompletion = await axios.post(
    'http://host.docker.internal:11434/api/chat',
    {
      model: 'gemma2:9b',
      messages: messages,
      stream: false,
      options: {
        seed: 101,
        temperature: 0
      }
    }
  );

  return chatCompletion.data.message.content;
}
