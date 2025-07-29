import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeneratorService } from './generator.service';

@Module({
  imports: [ConfigModule], // Добавляем ConfigModule
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}