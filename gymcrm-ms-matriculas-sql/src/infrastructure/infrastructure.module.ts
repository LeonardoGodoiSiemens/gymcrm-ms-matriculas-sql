import { Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from '../domain/event-publisher';
import { ENROLLMENT_REPOSITORY } from '../domain/enrollment.repository';
import { LoggingEventPublisher } from './events/logging-event.publisher';
import { ServiceBusEventPublisher } from './events/service-bus-event.publisher';
import { SqlConnection } from './sql/sql.connection';
import { SqlEnrollmentRepository } from './sql/sql-enrollment.repository';

@Module({
  providers: [
    SqlConnection,
    SqlEnrollmentRepository,
    { provide: ENROLLMENT_REPOSITORY, useExisting: SqlEnrollmentRepository },
    {
      provide: EVENT_PUBLISHER,
      useFactory: () => {
        const cs = process.env.SERVICEBUS_CONNECTION_STRING;
        return cs
          ? new ServiceBusEventPublisher(cs, process.env.SERVICEBUS_QUEUE ?? 'enrollment-created')
          : new LoggingEventPublisher();
      },
    },
  ],
  exports: [ENROLLMENT_REPOSITORY, EVENT_PUBLISHER, SqlConnection],
})
export class InfrastructureModule {}
