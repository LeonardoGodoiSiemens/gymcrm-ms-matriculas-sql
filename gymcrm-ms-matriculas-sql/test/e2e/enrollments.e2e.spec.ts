import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../../src/api/configure-app';
import { EnrollmentsController } from '../../src/api/enrollments.controller';
import { ENROLLMENT_HANDLERS } from '../../src/api/enrollments.module';
import { EventsDocsController } from '../../src/api/events-docs.controller';
import { ENROLLMENT_REPOSITORY } from '../../src/domain/enrollment.repository';
import { EVENT_PUBLISHER } from '../../src/domain/event-publisher';
import { FakeEventPublisher } from '../fakes/fake-event-publisher';
import { InMemoryEnrollmentRepository } from '../fakes/in-memory-enrollment.repository';

describe('Enrollments API (e2e, in-memory repository)', () => {
  let app: INestApplication;
  const publisher = new FakeEventPublisher();
  const body = {
    studentName: 'João Lima', studentEmail: 'joao@email.com', planName: 'Crossfit',
    period: 'MONTHLY', monthlyPrice: 199.9, startDate: '2026-11-01T00:00:00.000Z',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EnrollmentsController, EventsDocsController],
      providers: [
        ...ENROLLMENT_HANDLERS,
        { provide: ENROLLMENT_REPOSITORY, useValue: new InMemoryEnrollmentRepository() },
        { provide: EVENT_PUBLISHER, useValue: publisher },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => app.close());

  it('full CRUD flow, renewal and event publication', async () => {
    const created = await request(app.getHttpServer()).post('/enrollments').send(body).expect(201);
    const id = created.body.id;
    expect(created.body).toMatchObject({ total: 199.9, status: 'ACTIVE' });
    expect(publisher.published).toHaveLength(1);

    await request(app.getHttpServer()).get(`/enrollments/${id}`).expect(200);
    expect((await request(app.getHttpServer()).get('/enrollments').expect(200)).body).toHaveLength(1);

    const frozen = await request(app.getHttpServer()).put(`/enrollments/${id}`).send({ ...body, period: 'QUARTERLY', status: 'FROZEN' }).expect(200);
    expect(frozen.body).toMatchObject({ total: 599.7, status: 'FROZEN' });

    const renewed = await request(app.getHttpServer()).post(`/enrollments/${id}/renew`).expect(200);
    expect(renewed.body.status).toBe('ACTIVE');

    await request(app.getHttpServer()).delete(`/enrollments/${id}`).expect(204);
    await request(app.getHttpServer()).get(`/enrollments/${id}`).expect(404);
  });

  it('returns 400 for invalid payload', async () => {
    await request(app.getHttpServer()).post('/enrollments').send({ studentName: '', studentEmail: 'x', period: 'WEEKLY', monthlyPrice: -1 }).expect(400);
  });

  it('returns 400 for a non-numeric id', async () => {
    await request(app.getHttpServer()).get('/enrollments/abc').expect(400);
  });

  it('returns 404 with standard error body for an unknown id', async () => {
    const res = await request(app.getHttpServer()).delete('/enrollments/12345').expect(404);
    expect(res.body.code).toBe('ENROLLMENT_NOT_FOUND');
  });

  it('serves the AsyncAPI contract and the events page', async () => {
    const yaml = await request(app.getHttpServer()).get('/asyncapi.yaml').expect(200);
    expect(yaml.text).toContain('asyncapi: 3.0.0');
    expect(yaml.text).toContain('EnrollmentCreated');
    const page = await request(app.getHttpServer()).get('/events').expect(200);
    expect(page.text).toContain('asyncapi-component');
  });
});
