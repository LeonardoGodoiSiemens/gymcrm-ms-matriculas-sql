import { EnrollmentCreatedEvent } from './events';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventPublisher {
  publish(event: EnrollmentCreatedEvent): Promise<void>;
}
