export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export class EnrollmentNotFoundError extends Error {
  constructor(id: number | string) {
    super(`Enrollment with id '${id}' was not found`);
    this.name = 'EnrollmentNotFoundError';
  }
}
