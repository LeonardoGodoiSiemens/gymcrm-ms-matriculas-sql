import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainValidationError, EnrollmentNotFoundError } from '../../domain/errors';

@Catch(DomainValidationError, EnrollmentNotFoundError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const isNotFound = exception instanceof EnrollmentNotFoundError;
    response.status(isNotFound ? 404 : 400).json({
      code: isNotFound ? 'ENROLLMENT_NOT_FOUND' : 'VALIDATION_ERROR',
      message: exception.message,
    });
  }
}
