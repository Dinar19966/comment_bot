import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommentService } from '../comment/comment.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private readonly commentService: CommentService) {}

  @Cron('0 9 * * *') // каждый день в 09:00
  async initDailySchedule() {
    const count = this.getRandomInt(20, 30);
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const hour = this.getRandomInt(9, 19);
      const minute = this.getRandomInt(0, 59);
      const execTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

      const delay = execTime.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(() => this.runOneTask(i + 1), delay);
      }
    }

    this.logger.log(`Запланировано ${count} комментариев на сегодня`);
  }

  private async runOneTask(index: number) {
    this.logger.log(`🚀 Выполнение задачи #${index}`);
    await this.commentService.generateAndSendComment();
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
