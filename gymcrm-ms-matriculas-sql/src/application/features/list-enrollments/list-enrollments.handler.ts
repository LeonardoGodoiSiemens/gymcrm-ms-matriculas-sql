import { Inject, Injectable } from '@nestjs/common';
import { ENROLLMENT_REPOSITORY, EnrollmentRepository } from '../../../domain/enrollment.repository';
import { EnrollmentView, toView } from '../../shared/enrollment-view';

export interface ListEnrollmentsQuery {
  page?: number;
  limit?: number;
}

@Injectable()
export class ListEnrollmentsHandler {
  constructor(@Inject(ENROLLMENT_REPOSITORY) private readonly repository: EnrollmentRepository) {}

  async execute(query: ListEnrollmentsQuery = {}): Promise<EnrollmentView[]> {
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
    const page = Math.max(query.page ?? 1, 1);
    const enrollments = await this.repository.findAll({ skip: (page - 1) * limit, limit });
    return enrollments.map(toView);
  }
}
