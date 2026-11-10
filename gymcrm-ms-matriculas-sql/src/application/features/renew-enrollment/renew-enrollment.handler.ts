import { Inject, Injectable } from '@nestjs/common';
import { EnrollmentNotFoundError } from '../../../domain/errors';
import { ENROLLMENT_REPOSITORY, EnrollmentRepository } from '../../../domain/enrollment.repository';
import { EnrollmentView, toView } from '../../shared/enrollment-view';

export interface RenewEnrollmentCommand {
  id: number;
}

/** RF04 — renovação de matrícula: estende a vigência em um período e reativa a matrícula. */
@Injectable()
export class RenewEnrollmentHandler {
  constructor(@Inject(ENROLLMENT_REPOSITORY) private readonly repository: EnrollmentRepository) {}

  async execute(command: RenewEnrollmentCommand): Promise<EnrollmentView> {
    const enrollment = await this.repository.findById(command.id);
    if (!enrollment) throw new EnrollmentNotFoundError(command.id);
    enrollment.renew();
    const saved = await this.repository.update(enrollment);
    if (!saved) throw new EnrollmentNotFoundError(command.id);
    return toView(saved);
  }
}
