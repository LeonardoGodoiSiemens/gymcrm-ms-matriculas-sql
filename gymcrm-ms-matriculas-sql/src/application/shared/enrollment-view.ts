import { Enrollment } from '../../domain/enrollment.entity';

export interface EnrollmentView {
  id: number;
  studentName: string;
  studentEmail: string;
  planName: string;
  period: string;
  monthlyPrice: number;
  total: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export function toView(e: Enrollment): EnrollmentView {
  return {
    id: e.id as number,
    studentName: e.studentName,
    studentEmail: e.studentEmail,
    planName: e.planName,
    period: e.period,
    monthlyPrice: e.monthlyPrice,
    total: e.total,
    status: e.status,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
  };
}
