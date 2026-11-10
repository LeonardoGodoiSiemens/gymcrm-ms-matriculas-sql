import { Inject, Injectable, Logger } from '@nestjs/common';
import { Enrollment } from '../../../domain/enrollment.entity';
import { ENROLLMENT_REPOSITORY, EnrollmentRepository } from '../../../domain/enrollment.repository';
import { EVENT_PUBLISHER, EventPublisher } from '../../../domain/event-publisher';
import { enrollmentCreatedEvent } from '../../../domain/events';
import { EnrollmentView, toView } from '../../shared/enrollment-view';

export interface CreateEnrollmentCommand {
  studentName: string;
  studentEmail: string;
  planName: string;
  period: string;
  monthlyPrice: number;
  startDate?: string;
}

@Injectable()
export class CreateEnrollmentHandler {
  private readonly logger = new Logger(CreateEnrollmentHandler.name);

  constructor(
    @Inject(ENROLLMENT_REPOSITORY) private readonly repository: EnrollmentRepository,
    @Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateEnrollmentCommand): Promise<EnrollmentView> {
    const startDate = command.startDate ? new Date(command.startDate) : undefined;
    const enrollment = Enrollment.create({ ...command, startDate });
    const saved = await this.repository.create(enrollment);

    // Event-driven: avisa os interessados (Function de notificação/financeiro). Publicação "best effort":
    // uma falha no broker não desfaz a matrícula já gravada.
    try {
      await this.publisher.publish(enrollmentCreatedEvent(saved));
    } catch (error) {
      this.logger.error(`Failed to publish EnrollmentCreated for enrollment ${saved.id}: ${(error as Error).message}`);
    }
    return toView(saved);
  }
}
