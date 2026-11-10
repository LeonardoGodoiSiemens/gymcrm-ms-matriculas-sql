import { Inject, Injectable } from '@nestjs/common';
import { EnrollmentNotFoundError } from '../../../domain/errors';
import { ENROLLMENT_REPOSITORY, EnrollmentRepository } from '../../../domain/enrollment.repository';
import { EnrollmentView, toView } from '../../shared/enrollment-view';

export interface UpdateEnrollmentCommand {
  id: number;
  studentName: string;
  studentEmail: string;
  planName: string;
  period: string;
  monthlyPrice: number;
  status: string;
  startDate?: string;
}

@Injectable()
export class UpdateEnrollmentHandler {
  constructor(@Inject(ENROLLMENT_REPOSITORY) private readonly repository: EnrollmentRepository) {}

  async execute(command: UpdateEnrollmentCommand): Promise<EnrollmentView> {
    const enrollment = await this.repository.findById(command.id);
    if (!enrollment) throw new EnrollmentNotFoundError(command.id);
    enrollment.update({ ...command, startDate: command.startDate ? new Date(command.startDate) : undefined });
    const saved = await this.repository.update(enrollment);
    if (!saved) throw new EnrollmentNotFoundError(command.id);
    return toView(saved);
  }
}
