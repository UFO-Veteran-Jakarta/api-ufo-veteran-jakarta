const { deleteUserByUsername } = require('src/models/userModel');
const request = require('supertest');
const app = require('src/app');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const setupAuthHeaders = async (username, password) => {
  await request(app).post('/api/v1/register').send({ username, password });
  const login = await request(app)
    .post('/api/v1/login')
    .send({ username, password });
  const token = login.body.authorization.token;
  return {
    Cookie: `token=${token}`,
    Authorization: `Bearer ${token}`,
  };
};

const validateErrorResponse = (res, statusCode, message) => {
  expect(res.statusCode).toEqual(statusCode);
  expect(res.body.status).toEqual(statusCode);
  expect(res.body.message).toEqual(message);
};

const validateSuccessResponse = (res, statusCode, message) => {
  expect(res.statusCode).toEqual(statusCode);
  expect(res.body.status).toEqual(statusCode);
  expect(res.body.message).toEqual(message);
  expect(res.body.message).toBeDefined();
};

describe('Event Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername('admin');
  });

  describe('POST /api/v1/events', () => {
    it('should be rejected if user not authenticated', async () => {
      const res = await request(app).post('/api/v1/events');
      validateErrorResponse(res, 401, 'Unauthorized');
    });

    it('should be rejected if cover and cover landscape not exist', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const res = await request(app).post('/api/v1/events').set(headers);

      validateErrorResponse(res, 500, 'Cover and Cover Landscape Requirements');
    });

    it('should be rejected if cover and cover landscape is not webp', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePath = path.resolve(__dirname, '../test.jpg');
      const res = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePath)
        .attach('cover_landscape', filePath);

      validateErrorResponse(
        res,
        500,
        'Cover/Cover Landscape must be in WEBP Format',
      );
    });

    it('should be rejected if cover is not 1080px x 1080px', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePath = path.resolve(__dirname, '../test-small.webp');
      const res = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePath)
        .attach('cover_landscape', filePath);

      validateErrorResponse(res, 500, 'Cover must in 1080px x 1080px in size');
    });

    it('should be rejected if cover landscape not 2000px x 1047px', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePathCover = path.resolve(__dirname, '../test-1080.webp');
      const filePathLandscape = path.resolve(__dirname, '../test-small.webp');
      const res = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePathCover)
        .attach('cover_landscape', filePathLandscape);

      validateErrorResponse(
        res,
        500,
        'Cover Landscape must in 2000px x 1047px in size',
      );
    });

    it('should be accepted if cover and cover landscape are less than 500kb', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePathCover = path.resolve(__dirname, '../test-1080.webp');
      const filePathLandscape = path.resolve(
        __dirname,
        '../test-cc-2000-1047.webp',
      );
      const res = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePathCover)
        .attach('cover_landscape', filePathLandscape);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/events', () => {
    it('should return all events', async () => {
      const res = await request(app).get('/api/v1/events');
      validateSuccessResponse(res, 200, 'Successfully Get All Events');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/events/:slug', () => {
    it('should return an event by slug', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePathCover = path.resolve(__dirname, '../test-1080.webp');
      const filePathLandscape = path.resolve(
        __dirname,
        '../test-cc-2000-1047.webp',
      );

      const eventData = {
        name: 'Event Test',
        start_event_date: '2024-07-26',
        end_event_date: '2024-07-26',
        start_event_time: '1000',
        end_event_time: '1800',
        registration_start_date: '2024-07-26',
        registration_end_date: '2024-07-26',
        registration_start_time: '1000',
        registration_end_time: '1800',
        body: 'Event Test Body',
        link_registration: 'https://link-registration.com',
        location: 'Test Location',
        snippets: 'Test Snippets',
      };

      const event = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePathCover)
        .attach('cover_landscape', filePathLandscape)
        .field(eventData);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await request(app).get(
        `/api/v1/events/${event.body.slug}`,
      );

      validateSuccessResponse(res, 200, 'Successfully Get Event');
      expect(res.body.slug).toBe(event.body.slug);
    });

    it('should return 404 if event is not found', async () => {
      const res = await request(app).get('/api/v1/events/non-existent-slug');
      validateErrorResponse(res, 404, 'Event not found');
    });
  });

  describe('PUT /api/v1/events/:slug', () => {
    it('should be rejected if user not authenticated', async () => {
      const res = await request(app).put('/api/v1/events/some-slug');
      validateErrorResponse(res, 401, 'Unauthorized');
    });

    it('should be able to edit event', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePathCover = path.resolve(__dirname, '../test-1080.webp');
      const filePathLandscape = path.resolve(
        __dirname,
        '../test-cc-2000-1047.webp',
      );

      const eventData = {
        name: 'Event Test',
        start_event_date: '2024-07-26',
        end_event_date: '2024-07-26',
        start_event_time: '1000',
        end_event_time: '1800',
        registration_start_date: '2024-07-26',
        registration_end_date: '2024-07-26',
        registration_start_time: '1000',
        registration_end_time: '1800',
        body: 'Event Test Body',
        link_registration: 'https://link-registration.com',
        location: 'Test Location',
        snippets: 'Test Snippets',
      };

      const event = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePathCover)
        .attach('cover_landscape', filePathLandscape)
        .field(eventData);

      const updateData = {
        name: 'Updated Event',
        start_event_date: '2024-08-26',
        end_event_date: '2024-08-26',
        start_event_time: '1100',
        end_event_time: '1900',
        registration_start_date: '2024-08-26',
        registration_end_date: '2024-08-26',
        registration_start_time: '1100',
        registration_end_time: '1900',
        body: 'Updated Event Body',
        link_registration: 'https://updated-link-registration.com',
        location: 'Updated Location',
        snippets: 'Updated Snippets',
      };

      const res = await request(app)
        .put(`/api/v1/events/${event.body.data.slug}`)
        .set(headers)
        .send(updateData);

      validateSuccessResponse(res, 200, 'Successfully Edit This Event');
      expect(res.body.data.name).toBe(updateData.name);
      expect(res.body.data.link_registration).toBe(
        updateData.link_registration,
      );
    });
  });

  describe('DELETE /api/v1/events/:slug', () => {
    it('should be rejected if user not authenticated', async () => {
      const res = await request(app).delete('/api/v1/events/some-slug');
      validateErrorResponse(res, 401, 'Unauthorized');
    });

    it('should be able to delete event', async () => {
      const headers = await setupAuthHeaders('admin', 'Admin@12345');
      const filePathCover = path.resolve(__dirname, '../test-1080.webp');
      const filePathLandscape = path.resolve(
        __dirname,
        '../test-cc-2000-1047.webp',
      );

      const eventData = {
        name: 'Event Test',
        start_event_date: '2024-07-26',
        end_event_date: '2024-07-26',
        start_event_time: '1000',
        end_event_time: '1800',
        registration_start_date: '2024-07-26',
        registration_end_date: '2024-07-26',
        registration_start_time: '1000',
        registration_end_time: '1800',
        body: 'Event Test Body',
        link_registration: 'https://link-registration.com',
        location: 'Test Location',
        snippets: 'Test Snippets',
      };

      const event = await request(app)
        .post('/api/v1/events')
        .set(headers)
        .attach('cover', filePathCover)
        .attach('cover_landscape', filePathLandscape)
        .field(eventData);

      const res = await request(app)
        .delete(`/api/v1/events/${event.body.data.slug}`)
        .set(headers);

      validateSuccessResponse(res, 200, 'Event deleted successfully');
    });
  });
});
