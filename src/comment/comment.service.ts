import { Injectable, Logger } from '@nestjs/common';
import { GeneratorService } from '../generator/generator.service';
import { PostService } from '../post/post.service';
import { RedisService } from '../common/redis.service';
import axios from 'axios';
import { PostDto } from '../post/post.interface';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);
  private readonly commentApiUrl = 'https://develop.apps.bazar-dev.com/api/gate/comment';
  private readonly token = process.env.X_AUTH_TOKEN;

  constructor(
    private readonly generatorService: GeneratorService,
    private readonly postService: PostService,
    private readonly redisService: RedisService,
  ) {}

  async generateAndSendComment() {
    this.logger.log('Запуск генерации комментария')
    const posts: PostDto[] = await this.postService.getRecentPosts();

    const available: PostDto[] = [];

    for (const post of posts) {
      const already = await this.redisService.isAlreadyCommented(post.id);
      if (!already) available.push(post);
    }

    if (available.length === 0) {
      this.logger.warn('Нет свежих постов без комментариев');
      return;
    }

    const post = available[Math.floor(Math.random() * available.length)];
    const commentText = await this.generatorService.generateComment(post.text);

    const payload = {
      postId: post.id,
      parentId: null,
      content: {
        editorState: {
          root: {
            type: 'root',
            indent: 0,
            version: 1,
            format: '',
            direction: null,
            children: [
              {
                type: 'paragraph',
                indent: 0,
                version: 1,
                format: '',
                direction: null,
                children: [
                  {
                    type: 'text',
                    text: commentText,
                    mode: 'normal',
                    style: '',
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                ],
              },
            ],
          },
        },
      },
    };

    try {
      const res = await axios.post(this.commentApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Cookie: `x-auth-token=${this.token}`,
        },
      });

      await this.redisService.markAsCommented(post.id);
      this.logger.log(`✅ Отправлен комментарий к посту ${post.id}`);
    } catch (error) {
      this.logger.error(`❌ Ошибка отправки комментария: ${error.message}`);
    }
  }
}
