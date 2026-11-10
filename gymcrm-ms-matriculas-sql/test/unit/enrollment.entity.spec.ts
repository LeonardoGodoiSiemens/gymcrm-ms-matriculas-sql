import { addMonths, Enrollment } from '../../src/domain/enrollment.entity';
import { DomainValidationError } from '../../src/domain/errors';

const data = { studentName: ' Maria Souza ', studentEmail: 'Maria@Email.com', planName: 'Musculação', period: 'QUARTERLY', monthlyPrice: 100 };
const now = new Date('2026-11-01T00:00:00.000Z');

describe('Enrollment entity', () => {
  it('creates an ACTIVE enrollment, trims/normalizes fields and computes total and end date', () => {
    const e = Enrollment.create(data, now);
    expect(e).toMatchObject({ studentName: 'Maria Souza', studentEmail: 'maria@email.com', total: 300, status: 'ACTIVE' });
    expect(e.endDate.toISOString()).toBe('2027-02-01T00:00:00.000Z');
  });

  it.each([
    ['MONTHLY', 100, '2026-12-01'],
    ['ANNUAL', 1200, '2027-11-01'],
  ])('computes total and end date for %s', (period, total, end) => {
    const e = Enrollment.create({ ...data, period }, now);
    expect(e.total).toBe(total);
    expect(e.endDate.toISOString().slice(0, 10)).toBe(end);
  });

  it('uses the informed startDate', () => {
    const e = Enrollment.create({ ...data, startDate: new Date('2026-12-15T00:00:00.000Z') }, now);
    expect(e.startDate.toISOString()).toBe('2026-12-15T00:00:00.000Z');
  });

  it.each([
    [{ studentName: ' ' }], [{ studentEmail: 'invalid' }], [{ planName: '' }],
    [{ period: 'WEEKLY' }], [{ monthlyPrice: -1 }], [{ monthlyPrice: NaN }], [{ startDate: new Date('x') }],
  ])('rejects invalid data %j', (patch) => {
    expect(() => Enrollment.create({ ...data, ...patch }, now)).toThrow(DomainValidationError);
  });

  it('update recalculates total/end date and validates status', () => {
    const e = Enrollment.create(data, now);
    e.update({ ...data, period: 'ANNUAL', monthlyPrice: 50, status: 'FROZEN' });
    expect(e).toMatchObject({ total: 600, status: 'FROZEN' });
    expect(e.endDate.toISOString()).toBe('2027-11-01T00:00:00.000Z');
    expect(() => e.update({ ...data, status: 'NOPE' })).toThrow(DomainValidationError);
  });

  it('renew extends the end date by one period and reactivates a frozen enrollment', () => {
    const e = Enrollment.create(data, now);
    e.update({ ...data, status: 'FROZEN' });
    e.renew();
    expect(e.status).toBe('ACTIVE');
    expect(e.endDate.toISOString()).toBe('2027-05-01T00:00:00.000Z');
  });

  it('does not renew a cancelled enrollment', () => {
    const e = Enrollment.create(data, now);
    e.update({ ...data, status: 'CANCELLED' });
    expect(() => e.renew()).toThrow(DomainValidationError);
  });

  it('addMonths clamps to the last day of the month', () => {
    expect(addMonths(new Date('2026-01-31T00:00:00.000Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z');
  });
});
