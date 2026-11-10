import { CreateEnrollmentHandler } from '../../src/application/features/create-enrollment/create-enrollment.handler';
import { DeleteEnrollmentHandler } from '../../src/application/features/delete-enrollment/delete-enrollment.handler';
import { GetEnrollmentHandler } from '../../src/application/features/get-enrollment/get-enrollment.handler';
import { ListEnrollmentsHandler } from '../../src/application/features/list-enrollments/list-enrollments.handler';
import { RenewEnrollmentHandler } from '../../src/application/features/renew-enrollment/renew-enrollment.handler';
import { UpdateEnrollmentHandler } from '../../src/application/features/update-enrollment/update-enrollment.handler';
import { DomainValidationError, EnrollmentNotFoundError } from '../../src/domain/errors';
import { FakeEventPublisher } from '../fakes/fake-event-publisher';
import { InMemoryEnrollmentRepository } from '../fakes/in-memory-enrollment.repository';

describe('Enrollment use cases', () => {
  let repo: InMemoryEnrollmentRepository;
  let publisher: FakeEventPublisher;
  let create: CreateEnrollmentHandler;
  let get: GetEnrollmentHandler;
  let list: ListEnrollmentsHandler;
  let update: UpdateEnrollmentHandler;
  let remove: DeleteEnrollmentHandler;
  let renew: RenewEnrollmentHandler;
  const data = {
    studentName: 'Maria Souza', studentEmail: 'maria@email.com', planName: 'Musculação',
    period: 'QUARTERLY', monthlyPrice: 100, startDate: '2026-11-01T00:00:00.000Z',
  };

  beforeEach(() => {
    repo = new InMemoryEnrollmentRepository();
    publisher = new FakeEventPublisher();
    create = new CreateEnrollmentHandler(repo, publisher);
    get = new GetEnrollmentHandler(repo);
    list = new ListEnrollmentsHandler(repo);
    update = new UpdateEnrollmentHandler(repo);
    remove = new DeleteEnrollmentHandler(repo);
    renew = new RenewEnrollmentHandler(repo);
  });

  describe('CreateEnrollment', () => {
    it('persists the enrollment and returns a view', async () => {
      const view = await create.execute(data);
      expect(view).toMatchObject({ id: 1, total: 300, status: 'ACTIVE', endDate: '2027-02-01T00:00:00.000Z' });
    });

    it('publishes an EnrollmentCreated event with the enrollment data', async () => {
      const view = await create.execute(data);
      expect(publisher.published).toHaveLength(1);
      const event = publisher.published[0];
      expect(event.type).toBe('EnrollmentCreated');
      expect(event.eventId).toBeDefined();
      expect(event.data).toMatchObject({ enrollmentId: view.id, studentEmail: 'maria@email.com', period: 'QUARTERLY', total: 300 });
    });

    it('does not publish when validation fails', async () => {
      await expect(create.execute({ ...data, monthlyPrice: -5 })).rejects.toBeInstanceOf(DomainValidationError);
      expect(publisher.published).toHaveLength(0);
    });

    it('still creates the enrollment when the broker is down (best effort)', async () => {
      publisher.shouldFail = true;
      const view = await create.execute(data);
      expect(view.id).toBe(1);
      expect((await get.execute({ id: 1 })).studentName).toBe('Maria Souza');
    });
  });

  describe('GetEnrollment', () => {
    it('returns an existing enrollment', async () => {
      const created = await create.execute(data);
      expect((await get.execute({ id: created.id })).planName).toBe('Musculação');
    });
    it('throws EnrollmentNotFoundError when missing', async () => {
      await expect(get.execute({ id: 99 })).rejects.toBeInstanceOf(EnrollmentNotFoundError);
    });
  });

  describe('ListEnrollments', () => {
    it('paginates and clamps limits', async () => {
      for (let i = 0; i < 5; i++) await create.execute(data);
      expect(await list.execute({ page: 1, limit: 2 })).toHaveLength(2);
      expect(await list.execute({ page: 3, limit: 2 })).toHaveLength(1);
      expect(await list.execute()).toHaveLength(5);
      expect(await list.execute({ limit: 0 })).toHaveLength(1);
    });
  });

  describe('UpdateEnrollment', () => {
    it('freezes the enrollment and recalculates total', async () => {
      const created = await create.execute(data);
      const updated = await update.execute({ id: created.id, ...data, period: 'ANNUAL', monthlyPrice: 50, status: 'FROZEN' });
      expect(updated).toMatchObject({ period: 'ANNUAL', total: 600, status: 'FROZEN' });
    });
    it('throws when enrollment does not exist', async () => {
      await expect(update.execute({ id: 9, ...data, status: 'ACTIVE' })).rejects.toBeInstanceOf(EnrollmentNotFoundError);
    });
    it('rejects an invalid status', async () => {
      const created = await create.execute(data);
      await expect(update.execute({ id: created.id, ...data, status: 'NOPE' })).rejects.toBeInstanceOf(DomainValidationError);
    });
  });

  describe('RenewEnrollment', () => {
    it('extends the end date by one period', async () => {
      const created = await create.execute(data);
      const renewed = await renew.execute({ id: created.id });
      expect(renewed).toMatchObject({ status: 'ACTIVE', endDate: '2027-05-01T00:00:00.000Z' });
    });
    it('rejects renewal of a cancelled enrollment', async () => {
      const created = await create.execute(data);
      await update.execute({ id: created.id, ...data, status: 'CANCELLED' });
      await expect(renew.execute({ id: created.id })).rejects.toBeInstanceOf(DomainValidationError);
    });
    it('throws when enrollment does not exist', async () => {
      await expect(renew.execute({ id: 5 })).rejects.toBeInstanceOf(EnrollmentNotFoundError);
    });
  });

  describe('DeleteEnrollment', () => {
    it('deletes an existing enrollment', async () => {
      const created = await create.execute(data);
      await remove.execute({ id: created.id });
      await expect(get.execute({ id: created.id })).rejects.toBeInstanceOf(EnrollmentNotFoundError);
    });
    it('throws when enrollment does not exist', async () => {
      await expect(remove.execute({ id: 7 })).rejects.toBeInstanceOf(EnrollmentNotFoundError);
    });
  });
});
