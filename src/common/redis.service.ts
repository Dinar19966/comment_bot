// src/common/redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis

  constructor() {
    this.redis = new Redis(); // подключение к localhost:6379 по умолчанию
  }

  async isAlreadyCommented(postId: string): Promise<boolean> {
    return !!(await this.redis.get(`commented:${postId}`));
  }

  async markAsCommented(postId: string): Promise<void> {
    // TTL: 7 дней (в секундах)
    await this.redis.set(`commented:${postId}`, '1', 'EX', 7 * 24 * 60 * 60);
  }
}
