import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class GeneratorService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateComment(text: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Прочитай текст и напиши нейтральный, релевантный комментарий на русском языке к следующему посту: ${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    return response.choices[0].message.content ?? '';
  }
}
