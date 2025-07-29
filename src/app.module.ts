import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CommentModule } from './comment/comment.module';
import { GeneratorModule } from './generator/generator.module';
import { PostModule } from './post/post.module';
import { ScheduleTaskModule } from './schedule/schedule.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ScheduleModule.forRoot(),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 3,
      }),
    }),
    CommentModule,
    GeneratorModule,
    PostModule,
    ScheduleTaskModule,
  ],
})
export class AppModule {}