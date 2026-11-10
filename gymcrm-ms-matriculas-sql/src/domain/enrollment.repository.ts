import { Enrollment } from './enrollment.entity';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

export interface ListOptions {
  skip: number;
  limit: number;
}

export interface EnrollmentRepository {
  create(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: number): Promise<Enrollment | null>;
  findAll(options: ListOptions): Promise<Enrollment[]>;
  update(enrollment: Enrollment): Promise<Enrollment | null>;
  delete(id: number): Promise<boolean>;
}
