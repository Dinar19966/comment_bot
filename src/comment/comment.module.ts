import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { GeneratorModule } from '../generator/generator.module';
import { PostModule } from '../post/post.module';
import { RedisService } from '../common/redis.service';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      COMMENT_API_URL: process.env.COMMENT_API_URL,
      X_AUTH_TOKEN: process.env.X_AUTH_TOKEN,
    })),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 3,
      }),
    }),
    GeneratorModule,
    PostModule,
  ],
  providers: [CommentService, RedisService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}