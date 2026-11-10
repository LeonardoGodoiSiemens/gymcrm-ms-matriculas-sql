import { DomainValidationError } from './errors';

/** Status da matrícula: ativa, trancada ou cancelada (RF04). */
export const ENROLLMENT_STATUSES = ['ACTIVE', 'FROZEN', 'CANCELLED'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

/** Periodicidade do plano contratado pelo aluno. */
export const PLAN_PERIODS = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const;
export type PlanPeriod = (typeof PLAN_PERIODS)[number];

export const PERIOD_MONTHS: Record<PlanPeriod, number> = { MONTHLY: 1, QUARTERLY: 3, ANNUAL: 12 };

export interface EnrollmentData {
  studentName: string;
  studentEmail: string;
  planName: string;
  period: string;
  monthlyPrice: number;
  startDate?: Date;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: EnrollmentData): void {
  if (!data.studentName || data.studentName.trim().length === 0) {
    throw new DomainValidationError('Enrollment studentName is required');
  }
  if (!data.studentEmail || !EMAIL_RE.test(data.studentEmail.trim())) {
    throw new DomainValidationError('Enrollment studentEmail must be a valid e-mail');
  }
  if (!data.planName || data.planName.trim().length === 0) {
    throw new DomainValidationError('Enrollment planName is required');
  }
  if (!(PLAN_PERIODS as readonly string[]).includes(data.period)) {
    throw new DomainValidationError(`Enrollment period must be one of: ${PLAN_PERIODS.join(', ')}`);
  }
  if (typeof data.monthlyPrice !== 'number' || Number.isNaN(data.monthlyPrice) || data.monthlyPrice < 0) {
    throw new DomainValidationError('Enrollment monthlyPrice must be a number >= 0');
  }
  if (data.startDate !== undefined && Number.isNaN(data.startDate.getTime())) {
    throw new DomainValidationError('Enrollment startDate must be a valid date');
  }
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** Soma meses (UTC) limitando o dia ao último dia do mês de destino (31/01 + 1 mês = 28/02). */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export class Enrollment {
  constructor(
    public readonly id: number | null,
    public studentName: string,
    public studentEmail: string,
    public planName: string,
    public period: PlanPeriod,
    public monthlyPrice: number,
    public total: number,
    public status: EnrollmentStatus,
    public startDate: Date,
    public endDate: Date,
    public readonly createdAt: Date,
  ) {}

  static create(data: EnrollmentData, now: Date = new Date()): Enrollment {
    validate(data);
    const period = data.period as PlanPeriod;
    const months = PERIOD_MONTHS[period];
    const startDate = data.startDate ?? now;
    return new Enrollment(
      null, data.studentName.trim(), data.studentEmail.trim().toLowerCase(), data.planName.trim(), period,
      data.monthlyPrice, round2(data.monthlyPrice * months), 'ACTIVE', startDate, addMonths(startDate, months), now,
    );
  }

  update(data: EnrollmentData & { status: string }): void {
    validate(data);
    if (!(ENROLLMENT_STATUSES as readonly string[]).includes(data.status)) {
      throw new DomainValidationError(`Enrollment status must be one of: ${ENROLLMENT_STATUSES.join(', ')}`);
    }
    const period = data.period as PlanPeriod;
    const months = PERIOD_MONTHS[period];
    this.studentName = data.studentName.trim();
    this.studentEmail = data.studentEmail.trim().toLowerCase();
    this.planName = data.planName.trim();
    this.period = period;
    this.monthlyPrice = data.monthlyPrice;
    this.total = round2(data.monthlyPrice * months);
    this.status = data.status as EnrollmentStatus;
    if (data.startDate) this.startDate = data.startDate;
    this.endDate = addMonths(this.startDate, months);
  }

  /** Renovação (RF04): estende a vigência em um período do plano e reativa a matrícula. */
  renew(): void {
    if (this.status === 'CANCELLED') {
      throw new DomainValidationError('Cancelled enrollments cannot be renewed');
    }
    this.endDate = addMonths(this.endDate, PERIOD_MONTHS[this.period]);
    this.status = 'ACTIVE';
  }
}
