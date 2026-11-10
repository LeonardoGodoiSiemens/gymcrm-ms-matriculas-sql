import { Module } from '@nestjs/common';
import { CreateEnrollmentHandler } from '../application/features/create-enrollment/create-enrollment.handler';
import { DeleteEnrollmentHandler } from '../application/features/delete-enrollment/delete-enrollment.handler';
import { GetEnrollmentHandler } from '../application/features/get-enrollment/get-enrollment.handler';
import { ListEnrollmentsHandler } from '../application/features/list-enrollments/list-enrollments.handler';
import { RenewEnrollmentHandler } from '../application/features/renew-enrollment/renew-enrollment.handler';
import { UpdateEnrollmentHandler } from '../application/features/update-enrollment/update-enrollment.handler';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EnrollmentsController } from './enrollments.controller';
import { EventsDocsController } from './events-docs.controller';
import { HealthController } from './health.controller';

export const ENROLLMENT_HANDLERS = [
  CreateEnrollmentHandler, GetEnrollmentHandler, ListEnrollmentsHandler,
  UpdateEnrollmentHandler, DeleteEnrollmentHandler, RenewEnrollmentHandler,
];

@Module({
  imports: [InfrastructureModule],
  controllers: [EnrollmentsController, HealthController, EventsDocsController],
  providers: [...ENROLLMENT_HANDLERS],
})
export class EnrollmentsModule {}
