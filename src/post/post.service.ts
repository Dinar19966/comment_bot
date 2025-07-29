import { firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis.service';
import { ApiPost, PostDto } from './post.interface';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  private readonly apiUrl: string;
  private readonly categoryId: string;
  private readonly postsLimit: number;
  private readonly maxPostAgeDays: number;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>('POST_API_URL');
    this.categoryId = this.configService.getOrThrow<string>('POST_CATEGORY_ID');
    this.postsLimit = this.configService.get<number>('POSTS_LIMIT', 50);
    this.maxPostAgeDays = this.configService.get<number>('MAX_POST_AGE_DAYS', 2);
  }

  async getRecentPosts(): Promise<PostDto[]> {
    try {
      this.logger.debug('Fetching recent posts from API');
      
      const response = await firstValueFrom(
        this.http.get<ApiPost[]>(this.apiUrl, {
          params: {
            limit: this.postsLimit,
            offset: 0,
            categoryId: this.categoryId,
            isIdea: false,
          },
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        }),
      );

      const cutoffDate = DateTime.now().minus({ days: this.maxPostAgeDays });
      const seenPostsKey = 'seen_posts';

      const filteredPosts = response.data
        .filter(post => {
          const isNew = DateTime.fromISO(post.createdAt) > cutoffDate;
          const hasNoComments = post.commentsCount === 0;
          return isNew && hasNoComments;
        })
        .filter(async post => {
          const isSeen = await this.redisService.isAlreadyCommented(post.id);
          return !isSeen;
        });

      this.logger.log(`Found ${filteredPosts.length} suitable posts`);

      return filteredPosts.map(post => ({
        id: post.id,
        text: this.extractPostText(post),
        createdAt: post.createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch posts', error.stack);
      throw new Error(`Post fetch failed: ${error.message}`);
    }
  }

  private extractPostText(post: ApiPost): string {
    return (
      post.plainTextWithoutLinks || 
      post.plainText || 
      post.title || 
      'Без текста'
    ).trim().substring(0, 500); // Ограничиваем длину
  }

  async markPostAsProcessed(postId: string): Promise<void> {
    await this.redisService.markAsCommented(postId);
    this.logger.debug(`Marked post ${postId} as processed`);
  }
}