import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher } from '../../domain/event-publisher';
import { EnrollmentCreatedEvent } from '../../domain/events';

/** Fallback usado quando SERVICEBUS_CONNECTION_STRING não está configurada: apenas registra o evento no log. */
@Injectable()
export class LoggingEventPublisher implements EventPublisher {
  private readonly logger = new Logger('EventPublisher');

  async publish(event: EnrollmentCreatedEvent): Promise<void> {
    this.logger.log(`[no broker configured] ${JSON.stringify(event)}`);
  }
}
