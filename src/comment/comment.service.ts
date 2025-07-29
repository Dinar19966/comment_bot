import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { RedisService } from "src/common/redis.service";
import { GeneratorService } from "src/generator/generator.service";
import { PostDto } from "src/post/post.interface";
import { PostService } from "src/post/post.service";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);
  private readonly commentApiUrl: string;
  private readonly authToken: string;

  constructor(
    private readonly generatorService: GeneratorService,
    private readonly postService: PostService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.commentApiUrl = this.configService.getOrThrow<string>('COMMENT_API_URL');
    this.authToken = this.configService.getOrThrow<string>('X_AUTH_TOKEN');
  }

  async generateAndSendComment(): Promise<boolean> {
    try {
      this.logger.log('Starting comment generation');
      
      const post = await this.findAvailablePost();
      if (!post) {
        this.logger.warn('No available posts found');
        return false;
      }

      const commentText = await this.generateValidComment(post.text);
      const success = await this.sendComment(post.id, commentText);

      if (success) {
        this.logger.log(`Successfully commented post ${post.id}`);
      }
      return success;
    } catch (error) {
      this.logger.error('Comment generation failed', error.stack);
      return false;
    }
  }

  private async findAvailablePost(): Promise<PostDto | null> {
    const posts = await this.postService.getRecentPosts();
    for (const post of posts) {
      if (!(await this.redisService.isAlreadyCommented(post.id))) {
        return post;
      }
    }
    return null;
  }

  private async generateValidComment(text: string): Promise<string> {
    const comment = await this.generatorService.generateComment(text);
    return comment.trim().substring(0, 500);
  }
  
  private buildCommentPayload(postId: string, text: string) {
    return {
      postId,
      parentId: null,
      content: {
        editorState: {
          root: {
            children: [{
              children: [{ text }]
            }]
          }
        }
      }
    };
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Cookie': `x-auth-token=${this.authToken}`
    };
  }

  private async sendComment(postId: string, text: string): Promise<boolean> {
    try {
      const payload = this.buildCommentPayload(postId, text);
      await axios.post(this.commentApiUrl, payload, { 
        headers: this.getAuthHeaders(),
        timeout: 5000 
      });
      await this.redisService.markAsCommented(postId);
      return true;
    } catch (error) {
      this.logger.error(`Failed to post comment to ${postId}`, {
        error: error.message,
        textSample: text.substring(0, 50)
      });
      return false;
    }
  }
}
