import { EventPublisher } from '../../src/domain/event-publisher';
import { EnrollmentCreatedEvent } from '../../src/domain/events';

export class FakeEventPublisher implements EventPublisher {
  published: EnrollmentCreatedEvent[] = [];
  shouldFail = false;

  async publish(event: EnrollmentCreatedEvent): Promise<void> {
    if (this.shouldFail) throw new Error('broker unavailable');
    this.published.push(event);
  }
}
