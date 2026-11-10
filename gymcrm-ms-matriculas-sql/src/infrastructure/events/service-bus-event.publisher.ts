import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { EventPublisher } from '../../domain/event-publisher';
import { EnrollmentCreatedEvent } from '../../domain/events';

/** Publica eventos em uma fila do Azure Service Bus (consumida pela Azure Function com Message Trigger). */
@Injectable()
export class ServiceBusEventPublisher implements EventPublisher, OnModuleDestroy {
  private readonly logger = new Logger('EventPublisher');
  private client?: ServiceBusClient;
  private sender?: ServiceBusSender;

  constructor(private readonly connectionString: string, private readonly queueName: string) {}

  private getSender(): ServiceBusSender {
    if (!this.sender) {
      this.client = new ServiceBusClient(this.connectionString);
      this.sender = this.client.createSender(this.queueName);
    }
    return this.sender;
  }

  async publish(event: EnrollmentCreatedEvent): Promise<void> {
    await this.getSender().sendMessages({
      messageId: event.eventId,
      contentType: 'application/json',
      subject: event.type,
      body: event,
    });
    this.logger.log(`Published ${event.type} (enrollment ${event.data.enrollmentId}) to queue '${this.queueName}'`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.sender?.close();
    await this.client?.close();
  }
}
