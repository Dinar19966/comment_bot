import { firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';
import { PostDto } from './post.interface';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PostService {
  private readonly url = 'https://develop.apps.bazar-dev.com/api/gate/post';
  private readonly categoryId = '740e8a83-61d9-4309-818c-85af564190b1';

  constructor(private readonly http: HttpService) {}

  async getRecentPosts(): Promise<PostDto[]> {
    const res = await firstValueFrom(
      this.http.get(this.url, {
        params: {
          limit: 50,
          offset: 0,
          categoryId: this.categoryId,
          isIdea: false,
        },
      }),
    );

    const twoDaysAgo = DateTime.now().minus({ days: 2 });

    const posts = res.data.filter((p) => {
      return (
        p.commentsCount === 0 &&
        DateTime.fromISO(p.createdAt) > twoDaysAgo
      );
    });

    return posts.map((p) => ({
      id: p.id,
      text: p.plainTextWithoutLinks || p.plainText || p.title,
    }));
  }
}
