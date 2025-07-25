import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { GeneratorModule } from '../generator/generator.module';
import { PostModule } from '../post/post.module';
import { RedisService } from '../common/redis.service';

@Module({
  imports: [GeneratorModule, PostModule],
  providers: [CommentService, RedisService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
