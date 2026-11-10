import { Inject, Injectable } from '@nestjs/common';
import { EnrollmentNotFoundError } from '../../../domain/errors';
import { ENROLLMENT_REPOSITORY, EnrollmentRepository } from '../../../domain/enrollment.repository';
import { EnrollmentView, toView } from '../../shared/enrollment-view';

export interface GetEnrollmentQuery {
  id: number;
}

@Injectable()
export class GetEnrollmentHandler {
  constructor(@Inject(ENROLLMENT_REPOSITORY) private readonly repository: EnrollmentRepository) {}

  async execute(query: GetEnrollmentQuery): Promise<EnrollmentView> {
    const enrollment = await this.repository.findById(query.id);
    if (!enrollment) throw new EnrollmentNotFoundError(query.id);
    return toView(enrollment);
  }
}
