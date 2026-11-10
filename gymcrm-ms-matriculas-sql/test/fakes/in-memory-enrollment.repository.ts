import { Enrollment } from '../../src/domain/enrollment.entity';
import { EnrollmentRepository, ListOptions } from '../../src/domain/enrollment.repository';

export class InMemoryEnrollmentRepository implements EnrollmentRepository {
  private items = new Map<number, Enrollment>();
  private seq = 0;

  async create(e: Enrollment): Promise<Enrollment> {
    const id = ++this.seq;
    const saved = new Enrollment(
      id, e.studentName, e.studentEmail, e.planName, e.period, e.monthlyPrice, e.total, e.status, e.startDate, e.endDate, e.createdAt,
    );
    this.items.set(id, saved);
    return saved;
  }
  async findById(id: number) { return this.items.get(id) ?? null; }
  async findAll(o: ListOptions) { return [...this.items.values()].slice(o.skip, o.skip + o.limit); }
  async update(e: Enrollment) {
    if (e.id === null || !this.items.has(e.id)) return null;
    this.items.set(e.id, e);
    return e;
  }
  async delete(id: number) { return this.items.delete(id); }
}
