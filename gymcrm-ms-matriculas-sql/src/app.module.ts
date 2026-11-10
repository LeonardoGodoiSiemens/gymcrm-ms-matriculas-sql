import { Module } from '@nestjs/common';
import { EnrollmentsModule } from './api/enrollments.module';

@Module({ imports: [EnrollmentsModule] })
export class AppModule {}
