import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
