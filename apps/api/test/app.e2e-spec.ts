import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('Workout sessions (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndLogin(label: string) {
    const email = `${label}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'StrongPassword123!',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'StrongPassword123!',
      })
      .expect(201);

    return `Bearer ${loginResponse.body.accessToken as string}`;
  }

  it('does not expose a workout session to another user', async () => {
    const ownerToken = await registerAndLogin('owner');
    const otherUserToken = await registerAndLogin('other');

    const sessionResponse = await request(app.getHttpServer())
      .post('/workout-sessions')
      .set('Authorization', ownerToken)
      .send({
        name: 'Private workout',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/workout-sessions/${sessionResponse.body.id as number}`)
      .set('Authorization', otherUserToken)
      .expect(404)
      .expect({
        message: 'Workout session not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('does not allow adding sets to a completed workout session', async () => {
    const ownerToken = await registerAndLogin('completed-session-owner');

    const sessionResponse = await request(app.getHttpServer())
      .post('/workout-sessions')
      .set('Authorization', ownerToken)
      .send({
        name: 'Completed workout',
      })
      .expect(201);

    const sessionId = sessionResponse.body.id as number;

    await request(app.getHttpServer())
      .post(`/workout-sessions/${sessionId}/sets`)
      .set('Authorization', ownerToken)
      .send({
        exerciseId: 2,
        setNumber: 1,
        weightKg: 80,
        reps: 8,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/workout-sessions/${sessionId}/complete`)
      .set('Authorization', ownerToken)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post(`/workout-sessions/${sessionId}/sets`)
      .set('Authorization', ownerToken)
      .send({
        exerciseId: 2,
        setNumber: 2,
        weightKg: 80,
        reps: 8,
      })
      .expect(400)
      .expect({
        message: 'Cannot add sets to a completed workout session',
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('rejects unexpected fields in a request body', async () => {
    const email = `validation-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'StrongPassword123!',
        name: 'This field is not allowed',
      })
      .expect(400)
      .expect({
        message: ['property name should not exist'],
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('preserves a workout session when its source plan is deleted', async () => {
    const ownerToken = await registerAndLogin('plan-deletion-owner');

    const planResponse = await request(app.getHttpServer())
      .post('/workout-plans')
      .set('Authorization', ownerToken)
      .send({
        name: 'Disposable plan',
      })
      .expect(201);

    const planId = planResponse.body.id as number;

    const dayResponse = await request(app.getHttpServer())
      .post(`/workout-plans/${planId}/days`)
      .set('Authorization', ownerToken)
      .send({
        name: 'Push',
        dayOfWeek: 0,
      })
      .expect(201);

    const dayId = dayResponse.body.id as number;

    const sessionResponse = await request(app.getHttpServer())
      .post('/workout-sessions')
      .set('Authorization', ownerToken)
      .send({
        planDayId: dayId,
      })
      .expect(201);

    const sessionId = sessionResponse.body.id as number;

    await request(app.getHttpServer())
      .delete(`/workout-plans/${planId}`)
      .set('Authorization', ownerToken)
      .expect(200);

    const sessionAfterDelete = await request(app.getHttpServer())
      .get(`/workout-sessions/${sessionId}`)
      .set('Authorization', ownerToken)
      .expect(200);

    expect(sessionAfterDelete.body).toMatchObject({
      id: sessionId,
      name: 'Push',
      planDayId: null,
    });
  });
});