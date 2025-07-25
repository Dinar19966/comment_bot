import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [CommentModule],
  providers: [ScheduleService],
})
export class ScheduleTaskModule {}
