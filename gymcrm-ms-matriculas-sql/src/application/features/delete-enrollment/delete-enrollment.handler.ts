import { Inject, Injectable } from '@nestjs/common';
import { EnrollmentNotFoundError } from '../../../domain/errors';
import { ENROLLMENT_REPOSITORY, EnrollmentRepository } from '../../../domain/enrollment.repository';

export interface DeleteEnrollmentCommand {
  id: number;
}

@Injectable()
export class DeleteEnrollmentHandler {
  constructor(@Inject(ENROLLMENT_REPOSITORY) private readonly repository: EnrollmentRepository) {}

  async execute(command: DeleteEnrollmentCommand): Promise<void> {
    const deleted = await this.repository.delete(command.id);
    if (!deleted) throw new EnrollmentNotFoundError(command.id);
  }
}
