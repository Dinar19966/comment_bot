import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { CommentModule } from './comment/comment.module';
import { GeneratorModule } from './generator/generator.module';
import { PostModule } from './post/post.module';
import { ScheduleTaskModule } from './schedule/schedule.module';
import { RedisService } from './common/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule,
    CommentModule,
    GeneratorModule,
    PostModule,
    ScheduleTaskModule,
  ],
  providers: [RedisService],
})
export class AppModule {}
