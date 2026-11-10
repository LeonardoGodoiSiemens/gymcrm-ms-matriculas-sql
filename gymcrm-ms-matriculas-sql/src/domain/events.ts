import { randomUUID } from 'crypto';
import { Enrollment } from './enrollment.entity';

export const ENROLLMENT_CREATED = 'EnrollmentCreated';

/** Contrato do evento (documentado em docs/asyncapi.yaml). */
export interface EnrollmentCreatedEvent {
  eventId: string;
  type: typeof ENROLLMENT_CREATED;
  occurredAt: string;
  data: {
    enrollmentId: number;
    studentName: string;
    studentEmail: string;
    planName: string;
    period: string;
    monthlyPrice: number;
    total: number;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export function enrollmentCreatedEvent(e: Enrollment): EnrollmentCreatedEvent {
  return {
    eventId: randomUUID(),
    type: ENROLLMENT_CREATED,
    occurredAt: new Date().toISOString(),
    data: {
      enrollmentId: e.id as number,
      studentName: e.studentName,
      studentEmail: e.studentEmail,
      planName: e.planName,
      period: e.period,
      monthlyPrice: e.monthlyPrice,
      total: e.total,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      status: e.status,
    },
  };
}
